import type { Row } from '~~/services/powersync/transforms'

import localforage from 'localforage'
import { disconnectPowerSync, getPowerSyncDb, watchTable } from '~~/services/powersync/db'
import { upsertRow } from '~~/services/powersync/mutations'

import type { CurrencyCode } from '~/components/currencies/types'
import type { LocaleSlug } from '~/components/locale/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useDemo } from '~/components/demo/useDemo'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { hasPersistedSession } from '~/composables/useAuthSession'
import { clearStoreCache, persistStoreCache } from '~/composables/useStoreCache'
import { blockPersist, isPersistBlocked } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'
import { createLogger } from '~/utils/logger'

export type User = {
  displayName?: string | null
  email?: string | null
  photoURL?: string | null
  uid: string
}

/** The 'user' slice of the cold-start snapshot (identity + settings) - see useStoreCache. */
export type UserSettingsCache = {
  baseCurrency?: CurrencyCode
  locale?: LocaleSlug
  user?: User | null
}

const logger = createLogger('user')

export const useUserStore = defineStore('user', () => {
  const { session, signOut: supabaseSignOut, user: authUser } = useSupabaseAuth()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const { isDemo } = useDemo()
  const user = ref<User | null>(null)
  const isSigningOut = ref(false)
  const baseCurrency = ref<CurrencyCode>('USD')
  const locale = ref<LocaleSlug>('en')

  let watchController: AbortController | null = null

  const currentUser = computed<User | null>(() => {
    if (authUser.value) {
      return {
        displayName: authUser.value.email,
        email: authUser.value.email,
        photoURL: null,
        uid: authUser.value.id,
      }
    }
    if (user.value && !isDemo.value && hasPersistedSession())
      return user.value
    return null
  })

  const uid = computed<string | null>(() => currentUser.value?.uid || null)

  function setUser(values: User | null) {
    user.value = values
      ? {
          displayName: values.displayName,
          email: values.email,
          photoURL: values.photoURL,
          uid: values.uid,
        }
      : null

    // Demo persists the user to its own localforage key; real mode mirrors into the cold-start snapshot.
    if (isDemo.value) {
      if (!isPersistBlocked())
        localforage.setItem(STORAGE_KEYS.user, user.value ? { ...user.value } : null)
    }
    else {
      persistUserCache()
    }
  }

  // Keep `user.value` in sync with the resolved session (real mode only; demo manages its own user).
  watch(
    () => session.value?.user,
    (sessionUser) => {
      if (!sessionUser || isSigningOut.value || isDemo.value)
        return
      const next: User = {
        displayName: sessionUser.email,
        email: sessionUser.email,
        photoURL: null,
        uid: sessionUser.id,
      }
      if (user.value?.uid === next.uid
        && user.value?.email === next.email
        && user.value?.displayName === next.displayName
        && user.value?.photoURL === next.photoURL) {
        return
      }
      setUser(next)
    },
    { immediate: true },
  )

  function persistUserSettings() {
    if (isPersistBlocked())
      return
    if (isDemo.value) {
      localforage.setItem(STORAGE_KEYS.userSettings, {
        baseCurrency: baseCurrency.value,
        locale: locale.value,
      })
      return
    }
    // Real mode: mirror settings into the per-user cold-start snapshot.
    persistUserCache()
  }

  /** Write the 'user' snapshot slice (identity + settings) for the next cold start. */
  function persistUserCache() {
    if (isDemo.value)
      return
    // toRaw: IndexedDB can't structure-clone a Vue proxy, so persist the plain target.
    persistStoreCache('user', {
      baseCurrency: baseCurrency.value,
      locale: locale.value,
      user: toRaw(user.value),
    } satisfies UserSettingsCache)
  }

  /** Cold-start paint: seed identity + settings from the snapshot before the user_settings watch emits. */
  function primeFromCache(data: UserSettingsCache | null): void {
    if (isDemo.value || !data)
      return
    if (data.user && !user.value)
      user.value = data.user
    if (data.baseCurrency)
      baseCurrency.value = data.baseCurrency
    if (data.locale && data.locale !== locale.value) {
      locale.value = data.locale
      useNuxtApp().$i18n.setLocale(data.locale)
    }
  }

  function setUserBaseCurrency(value: CurrencyCode) {
    baseCurrency.value = value
    persistUserSettings()
  }

  function saveUserBaseCurrency(value: CurrencyCode) {
    setUserBaseCurrency(value)

    if (isDemo.value || !uid.value)
      return

    upsertRow('user_settings', uid.value, {
      baseCurrency: value,
      locale: locale.value,
      userId: uid.value,
    }).catch((e) => {
      logger.error('saveUserBaseCurrency failed', e)
    })
  }

  function setUserLocale(value: LocaleSlug) {
    locale.value = value
    useNuxtApp().$i18n.setLocale(value)
    persistUserSettings()
  }

  function saveUserLocale(value: LocaleSlug) {
    setUserLocale(value)

    if (isDemo.value || !uid.value)
      return

    upsertRow('user_settings', uid.value, {
      baseCurrency: baseCurrency.value,
      locale: value,
      userId: uid.value,
    }).catch((e) => {
      logger.error('saveUserLocale failed', e)
    })
  }

  /** Real mode: subscribe to the user's settings row in local SQLite. */
  function initUserSettings(): void {
    if (isDemo.value)
      return

    watchController?.abort()
    watchController = watchTable<Row>('SELECT * FROM user_settings LIMIT 1', [], (rows) => {
      const s = rows[0]
      if (!s)
        return
      if (s.baseCurrency)
        baseCurrency.value = s.baseCurrency
      if (s.locale && s.locale !== locale.value) {
        locale.value = s.locale
        useNuxtApp().$i18n.setLocale(s.locale)
      }
      persistUserSettings()
    })
    logger.log('watching user settings')
  }

  async function signOut() {
    isSigningOut.value = true

    if (isDemo.value) {
      await localforage.clear()
      isDemo.value = undefined
      useCookie<boolean>('finapp.isOnboarded').value = false
      window.location.href = '/login'
      return
    }

    // Prevents in-flight mutation callbacks from re-writing data after cleanup.
    blockPersist()

    try {
      trnsStore.setTrns(null)
      categoriesStore.setCategories(null)
      walletsStore.setWallets(null)

      useTrnsFormStore().$reset()
      setUser(null)
      useCookie<boolean>('finapp.isOnboarded').value = false

      await Promise.all(
        Object.values(STORAGE_KEYS).map(key => localforage.removeItem(key)),
      )
      await clearStoreCache() // session still present here, so the uid resolves

      // Best-effort local wipe; if it fails the owner marker makes the next foreign sign-in wipe first.
      const cleared = await disconnectPowerSync()
      if (!cleared)
        logger.warn('local data not cleared on sign-out; will wipe on next foreign sign-in')

      await supabaseSignOut()
    }
    catch (error) {
      logger.error('signOut failed:', error)
    }
    finally {
      isSigningOut.value = false
    }

    window.location.href = '/login'
  }

  async function removeAllUserData() {
    blockPersist()

    trnsStore.setTrns(null)
    categoriesStore.setCategories(null)
    walletsStore.setWallets(null)
    useTrnsFormStore().$reset()

    useCookie<boolean>('finapp.isOnboarded').value = false

    if (isDemo.value) {
      await localforage.clear()
      return
    }

    try {
      const db = await getPowerSyncDb()
      await db.execute('DELETE FROM trns')
      await db.execute('DELETE FROM categories')
      await db.execute('DELETE FROM wallets')
      await db.execute('DELETE FROM user_settings')
      await clearStoreCache()
    }
    catch (e) {
      logger.error('removeAllUserData failed', e)
    }
  }

  return {
    baseCurrency,
    currentUser,
    initUserSettings,
    isSigningOut,
    locale,
    primeFromCache,
    removeAllUserData,
    saveUserBaseCurrency,
    saveUserLocale,
    setUser,
    setUserBaseCurrency,
    setUserLocale,
    signOut,
    uid,
  }
})
