import localforage from 'localforage'

import type { CurrencyCode } from '~/components/currencies/types'
import type { LocaleSlug } from '~/components/locale/types'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useDemo } from '~/components/demo/useDemo'
import { getOfflineOpsByEntity, pushOfflineOp } from '~/components/offline/helpers'
import { isReplaying } from '~/components/offline/replay'
import { STORAGE_KEYS } from '~/components/offline/storageKeys'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { userSettingsSchema } from '~/components/user/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { clearAuthCookie, hasAuthCookie, setSessionInitialized } from '~/composables/useAuthCookie'
import { stopAllRealtime } from '~/composables/useRealtimeSync'
import { blockPersist, handleMutationResult, isPersistBlocked } from '~/composables/useStoreSync'
import { createLogger } from '~/utils/logger'

export type User = {
  displayName?: string | null
  email?: string | null
  photoURL?: string | null
  uid: string
}

const logger = createLogger('user')

export const useUserStore = defineStore('user', () => {
  const authClient = useAuth()
  const session = authClient.useSession()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const { isDemo } = useDemo()
  const user = ref<User | null>(null)
  const isSigningOut = ref(false)
  const baseCurrency = ref<CurrencyCode>('USD')
  const locale = ref<LocaleSlug>('en')

  const currentUser = computed<User | null>(() => {
    const s = session.value
    const sessionUser = s?.data?.user
    if (sessionUser) {
      return {
        displayName: sessionUser.name,
        email: sessionUser.email,
        photoURL: sessionUser.image,
        uid: sessionUser.id,
      }
    }
    if (user.value && !isDemo.value && hasAuthCookie())
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

    if (!isPersistBlocked())
      localforage.setItem(STORAGE_KEYS.user, user.value ? { ...user.value } : null)
  }

  // Persist session user to cache on resolution so next reload has `user` synchronously.
  // Skipped in demo mode to avoid leaking real-auth session into demo's cleared cache.
  watch(
    () => session.value?.data?.user,
    (sessionUser) => {
      if (!sessionUser || isSigningOut.value || isDemo.value)
        return
      const next: User = {
        displayName: sessionUser.name,
        email: sessionUser.email,
        photoURL: sessionUser.image,
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
    localforage.setItem(STORAGE_KEYS.userSettings, {
      baseCurrency: baseCurrency.value,
      locale: locale.value,
    })
  }

  function setUserBaseCurrency(value: CurrencyCode) {
    baseCurrency.value = value
    persistUserSettings()
  }

  function saveUserBaseCurrency(value: CurrencyCode) {
    setUserBaseCurrency(value)

    if (isDemo.value || !uid.value)
      return

    logger.log(`optimistic update: baseCurrency → ${value}`)
    if (!isReplaying())
      pushOfflineOp({ data: { baseCurrency: value }, entity: 'userSettings', id: 'settings', type: 'update' })

    const { api, client } = useConvexClientWithApi()
    handleMutationResult({
      action: 'update',
      entity: 'userSettings',
      errorMessage: 'settings.errors.saveFailed',
      id: 'settings',
      mutation: client.mutation(api.user.upsert, { baseCurrency: value }),
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

    logger.log(`optimistic update: locale → ${value}`)
    if (!isReplaying())
      pushOfflineOp({ data: { locale: value }, entity: 'userSettings', id: 'settings', type: 'update' })

    const { api, client } = useConvexClientWithApi()
    handleMutationResult({
      action: 'update',
      entity: 'userSettings',
      errorMessage: 'settings.errors.saveFailed',
      id: 'settings',
      mutation: client.mutation(api.user.upsert, { locale: value }),
    })
  }

  function applyRealtimeSettings(settings: unknown): void {
    if (!settings)
      return
    const parsed = userSettingsSchema.safeParse(settings)
    if (!parsed.success)
      return
    if (parsed.data.baseCurrency !== baseCurrency.value) {
      baseCurrency.value = parsed.data.baseCurrency
      persistUserSettings()
    }
    if (parsed.data.locale && parsed.data.locale !== locale.value) {
      locale.value = parsed.data.locale
      useNuxtApp().$i18n.setLocale(parsed.data.locale)
      persistUserSettings()
    }
  }

  async function initUserSettings() {
    try {
      const { api, client } = useConvexClientWithApi()

      const settings = await client.query(api.user.get, {})
      if (!settings)
        return

      const parsed = userSettingsSchema.safeParse(settings)
      if (parsed.success) {
        baseCurrency.value = parsed.data.baseCurrency
        if (parsed.data.locale) {
          locale.value = parsed.data.locale
          useNuxtApp().$i18n.setLocale(parsed.data.locale)
        }
      }

      const pendingOps = await getOfflineOpsByEntity('userSettings')
      const partialSchema = userSettingsSchema.partial()
      for (const op of pendingOps) {
        const parsedOp = partialSchema.safeParse(op.data)
        if (!parsedOp.success)
          continue
        if (parsedOp.data.baseCurrency)
          baseCurrency.value = parsedOp.data.baseCurrency
        if (parsedOp.data.locale) {
          locale.value = parsedOp.data.locale
          useNuxtApp().$i18n.setLocale(parsedOp.data.locale)
        }
      }

      persistUserSettings()
    }
    catch (e) {
      logger.error('init user settings failed', e)
    }
  }

  async function signOut() {
    isSigningOut.value = true
    stopAllRealtime()

    if (isDemo.value) {
      await localforage.clear()
      isDemo.value = undefined
      clearAuthCookie()
      setSessionInitialized(false)
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
      clearAuthCookie()
      setSessionInitialized(false)
      useCookie<boolean>('finapp.isOnboarded').value = false

      const offlineKeys: Set<string> = new Set([STORAGE_KEYS.offlineQueue, STORAGE_KEYS.offlineQueueUserId])
      await Promise.all(
        Object.values(STORAGE_KEYS)
          .filter(key => !offlineKeys.has(key))
          .map(key => localforage.removeItem(key)),
      )

      await authClient.signOut()
    }
    catch (error) {
      logger.error('signOut failed:', error)
    }
    finally {
      isSigningOut.value = false
    }

    localStorage.removeItem('better-auth_cookie')
    localStorage.removeItem('better-auth_session_data')
    window.location.href = '/login'
  }

  async function removeAllUserData() {
    blockPersist()

    trnsStore.setTrns(null)
    categoriesStore.setCategories(null)
    walletsStore.setWallets(null)
    useTrnsFormStore().$reset()

    useCookie<boolean>('finapp.isOnboarded').value = false

    const { clearOfflineQueue, setOfflineQueueUserId } = await import('~/components/offline/helpers')
    await clearOfflineQueue()

    setOfflineQueueUserId(uid.value)

    if (!isDemo.value) {
      const { api, client } = useConvexClientWithApi()
      await client.action(api.user.removeAllUserData, {})
    }
  }

  return {
    applyRealtimeSettings,
    baseCurrency,
    currentUser,
    initUserSettings,
    isSigningOut,
    locale,
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
