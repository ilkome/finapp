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
import { clearAuthCookie, setSessionInitialized } from '~/composables/useAuthCookie'
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
    if (s?.isPending)
      return user.value // Not loaded yet — use Pinia cache
    return null // Session checked, no user
  })

  const uid = computed<string | null>(() => currentUser.value?.uid || null)

  function setUser(values: User | null) {
    if (!values) {
      user.value = null
    }
    else {
      user.value = {
        displayName: values.displayName,
        email: values.email,
        photoURL: values.photoURL,
        uid: values.uid,
      }
    }

    if (!isPersistBlocked())
      localforage.setItem(STORAGE_KEYS.user, user.value)
  }

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

      // Apply pending offline ops (local changes win over server).
      // Ops are partial — only override the fields they contain.
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

    if (isDemo.value) {
      await localforage.clear()
      isDemo.value = null
      clearAuthCookie()
      setSessionInitialized(false)
      window.location.href = '/login'
      return
    }

    // Block all persist operations — prevents in-flight mutation callbacks
    // from re-writing data to localforage after clear().
    blockPersist()

    try {
      trnsStore.setTrns(null)
      categoriesStore.setCategories(null)
      walletsStore.setWallets(null)

      useTrnsFormStore().$reset()
      setUser(null)
      clearAuthCookie()
      setSessionInitialized(false)
      await localforage.clear()
      await authClient.signOut()
    }
    catch (error) {
      logger.error('signOut failed:', error)
    }
    finally {
      isSigningOut.value = false
    }

    // Clean up AFTER all async work completes — no race with guard redirect.
    localStorage.removeItem('better-auth_cookie')
    localStorage.removeItem('better-auth_session_data')

    // Hard navigation creates clean page state. This runs only after all
    // cleanup is done, so the next login won't be interrupted.
    window.location.href = '/login'
  }

  async function removeAllUserData() {
    blockPersist()

    trnsStore.setTrns(null)
    categoriesStore.setCategories(null)
    walletsStore.setWallets(null)
    useTrnsFormStore().$reset()

    const { clearOfflineQueue, setOfflineQueueUserId } = await import('~/components/offline/helpers')
    await clearOfflineQueue()

    // Restore in-memory userId — clearOfflineQueue resets it to null,
    // but the user stays logged in and future pushes need ownership.
    setOfflineQueueUserId(uid.value)

    if (!isDemo.value) {
      const { api, client } = useConvexClientWithApi()
      await client.action(api.user.removeAllUserData, {})
    }
  }

  return {
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
