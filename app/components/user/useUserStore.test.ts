import localforage from 'localforage'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

// --- Entity-specific mocks ---

const mutationMock = vi.fn(() => Promise.resolve())
const queryMock = vi.fn((): Promise<any> => Promise.resolve(null))

const actionMock = vi.fn(() => Promise.resolve())

vi.stubGlobal('useConvexClientWithApi', () => ({
  api: {
    user: { get: 'user.get', removeAllUserData: 'user.removeAllUserData', upsert: 'user.upsert' },
  },
  client: {
    action: actionMock,
    mutation: mutationMock,
    query: queryMock,
  },
}))

const setLocaleMock = vi.fn()
vi.stubGlobal('useNuxtApp', () => ({
  $i18n: { setLocale: setLocaleMock },
}))

type SessionUser = { email: string, id: string, image: string | null, name: string }
type SessionData = { data: { user: SessionUser } | null, isPending: boolean }
const useSessionMock = vi.fn(() => ref<SessionData>({ data: null, isPending: false }))
const authSignOutMock = vi.fn(() => Promise.resolve())
vi.stubGlobal('useAuth', () => ({
  signOut: authSignOutMock,
  useSession: useSessionMock,
}))

vi.mock('~/components/categories/useCategoriesStore', () => ({
  useCategoriesStore: () => ({
    setCategories: (...args: unknown[]) => setCategoriesMock(...args),
  }),
}))

vi.mock('~/components/trns/useTrnsStore', () => ({
  useTrnsStore: () => ({
    setTrns: (...args: unknown[]) => setTrnsMock(...args),
  }),
}))

vi.mock('~/components/wallets/useWalletsStore', () => ({
  useWalletsStore: () => ({
    setWallets: (...args: unknown[]) => setWalletsMock(...args),
  }),
}))

vi.mock('~/components/trnForm/useTrnsFormStore', () => ({
  useTrnsFormStore: () => ({
    $reset: (...args: unknown[]) => trnFormResetMock(...args),
  }),
}))

const clearAuthCookieMock = vi.fn()
const setSessionInitializedMock = vi.fn()
vi.mock('~/composables/useAuthCookie', () => ({
  clearAuthCookie: (...args: unknown[]) => clearAuthCookieMock(...args),
  setSessionInitialized: (...args: unknown[]) => setSessionInitializedMock(...args),
}))

const blockPersistMock = vi.fn()
vi.mock('~/composables/useStoreSync', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~/composables/useStoreSync')>()
  return {
    ...actual,
    blockPersist: (...args: unknown[]) => blockPersistMock(...args),
  }
})

const setTrnsMock = vi.fn()
const setCategoriesMock = vi.fn()
const setWalletsMock = vi.fn()
const trnFormResetMock = vi.fn()

const clearOfflineQueueMock = vi.fn(() => Promise.resolve())
const setOfflineQueueUserIdMock = vi.fn()
vi.mock('~/components/offline/helpers', () => ({
  clearOfflineQueue: (...args: unknown[]) => clearOfflineQueueMock(...args),
  getOfflineOpsByEntity: vi.fn(() => Promise.resolve([])),
  pushOfflineOp: vi.fn(() => Promise.resolve()),
  setOfflineQueueUserId: (...args: unknown[]) => setOfflineQueueUserIdMock(...args),
}))

const useCookieMock = vi.fn(() => ({ value: null }))
vi.stubGlobal('useCookie', useCookieMock)

const { useUserStore } = await import('~/components/user/useUserStore')

// --- Tests ---

describe('useUserStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await localforage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('setUserBaseCurrency', () => {
    it('updates baseCurrency ref', () => {
      const store = useUserStore()
      store.setUserBaseCurrency('EUR')
      expect(store.baseCurrency).toBe('EUR')
    })

    it('persists to localforage', async () => {
      const store = useUserStore()
      store.setUserBaseCurrency('EUR')

      const saved = await localforage.getItem<any>('finapp.userSettings')
      expect(saved).toEqual({ baseCurrency: 'EUR', locale: 'en' })
    })
  })

  describe('saveUserBaseCurrency', () => {
    it('updates ref and calls Convex mutation', () => {
      useSessionMock.mockReturnValue(ref({ data: { user: { email: 'test@test.com', id: 'user1', image: null, name: 'Test' } }, isPending: false }))
      setActivePinia(createPinia())
      const store = useUserStore()
      store.saveUserBaseCurrency('JPY')

      expect(store.baseCurrency).toBe('JPY')
      expect(mutationMock).toHaveBeenCalledWith(
        'user.upsert',
        { baseCurrency: 'JPY' },
      )
    })

    it('skips Convex mutation in demo mode', async () => {
      const demoModule = await import('~/components/demo/useDemo')
      const original = demoModule.useDemo
      const demoWritable = demoModule as Record<string, typeof demoModule.useDemo>
      demoWritable.useDemo = () => ({ ...original(), isDemo: ref('true') })

      setActivePinia(createPinia())
      const store = useUserStore()
      store.saveUserBaseCurrency('GBP')

      expect(store.baseCurrency).toBe('GBP')
      expect(mutationMock).not.toHaveBeenCalled()

      demoWritable.useDemo = original
    })
  })

  describe('setUserLocale', () => {
    it('updates locale ref and calls setLocale', () => {
      const store = useUserStore()
      store.setUserLocale('ru')

      expect(store.locale).toBe('ru')
      expect(setLocaleMock).toHaveBeenCalledWith('ru')
    })

    it('persists to localforage', async () => {
      const store = useUserStore()
      store.setUserLocale('ru')

      const saved = await localforage.getItem<any>('finapp.userSettings')
      expect(saved).toEqual({ baseCurrency: 'USD', locale: 'ru' })
    })
  })

  describe('saveUserLocale', () => {
    it('calls Convex mutation when not in demo mode', () => {
      useSessionMock.mockReturnValue(ref({ data: { user: { email: 'test@test.com', id: 'user1', image: null, name: 'Test' } }, isPending: false }))
      setActivePinia(createPinia())
      const store = useUserStore()
      store.saveUserLocale('ru')

      expect(store.locale).toBe('ru')
      expect(mutationMock).toHaveBeenCalledWith(
        'user.upsert',
        { locale: 'ru' },
      )
    })

    it('skips Convex mutation in demo mode', async () => {
      const demoModule = await import('~/components/demo/useDemo')
      const original = demoModule.useDemo
      const demoWritable = demoModule as Record<string, typeof demoModule.useDemo>
      demoWritable.useDemo = () => ({ ...original(), isDemo: ref('true') })

      setActivePinia(createPinia())
      const store = useUserStore()
      store.saveUserLocale('ru')

      expect(store.locale).toBe('ru')
      expect(setLocaleMock).toHaveBeenCalledWith('ru')
      expect(mutationMock).not.toHaveBeenCalled()

      demoWritable.useDemo = original
    })
  })

  describe('initUserSettings', () => {
    it('sets baseCurrency and locale from Convex', async () => {
      queryMock.mockResolvedValue({ baseCurrency: 'EUR', locale: 'ru' })

      const store = useUserStore()
      await store.initUserSettings()

      expect(store.baseCurrency).toBe('EUR')
      expect(store.locale).toBe('ru')
      expect(setLocaleMock).toHaveBeenCalledWith('ru')
    })

    it('defaults to USD when baseCurrency is empty', async () => {
      queryMock.mockResolvedValue({ baseCurrency: '', locale: null })

      const store = useUserStore()
      await store.initUserSettings()

      expect(store.baseCurrency).toBe('USD')
    })

    it('does nothing when settings is null', async () => {
      queryMock.mockResolvedValue(null)

      const store = useUserStore()
      await store.initUserSettings()

      expect(store.baseCurrency).toBe('USD')
      expect(store.locale).toBe('en')
    })

    it('skips locale when not set in settings', async () => {
      queryMock.mockResolvedValue({ baseCurrency: 'GBP' })

      const store = useUserStore()
      await store.initUserSettings()

      expect(store.baseCurrency).toBe('GBP')
      expect(store.locale).toBe('en')
      expect(setLocaleMock).not.toHaveBeenCalled()
    })
  })

  describe('persistUserSettings', () => {
    it('saves both baseCurrency and locale together', async () => {
      const store = useUserStore()
      store.setUserBaseCurrency('EUR')
      store.setUserLocale('ru')

      const saved = await localforage.getItem<any>('finapp.userSettings')
      expect(saved).toEqual({ baseCurrency: 'EUR', locale: 'ru' })
    })
  })

  describe('signOut', () => {
    beforeEach(() => {
      // Mock window.location
      Object.defineProperty(window, 'location', {
        configurable: true,
        value: { href: '/' },
        writable: true,
      })
    })

    it('blocks persist to prevent race conditions', async () => {
      const store = useUserStore()
      await store.signOut()

      expect(blockPersistMock).toHaveBeenCalled()
    })

    it('resets all stores', async () => {
      const store = useUserStore()
      await store.signOut()

      expect(setTrnsMock).toHaveBeenCalledWith(null)
      expect(setCategoriesMock).toHaveBeenCalledWith(null)
      expect(setWalletsMock).toHaveBeenCalledWith(null)
      expect(trnFormResetMock).toHaveBeenCalled()
    })

    it('clears auth state', async () => {
      const store = useUserStore()
      await store.signOut()

      expect(clearAuthCookieMock).toHaveBeenCalled()
      expect(setSessionInitializedMock).toHaveBeenCalledWith(false)
    })

    it('clears localforage', async () => {
      await localforage.setItem('testKey', 'testValue')
      const store = useUserStore()
      await store.signOut()

      const value = await localforage.getItem('testKey')
      expect(value).toBeNull()
    })

    it('calls authClient.signOut', async () => {
      const store = useUserStore()
      await store.signOut()

      expect(authSignOutMock).toHaveBeenCalled()
    })

    it('redirects to /login', async () => {
      const store = useUserStore()
      await store.signOut()

      expect(window.location.href).toBe('/login')
    })

    it('resets isSigningOut after completion', async () => {
      const store = useUserStore()
      await store.signOut()

      expect(store.isSigningOut).toBe(false)
    })

    it('resets isSigningOut on error', async () => {
      authSignOutMock.mockRejectedValueOnce(new Error('network'))
      const store = useUserStore()
      await store.signOut()

      expect(store.isSigningOut).toBe(false)
    })
  })

  describe('removeAllUserData', () => {
    it('blocks persist', async () => {
      useSessionMock.mockReturnValue(ref({ data: { user: { email: 'a@a.com', id: 'u1', image: null, name: 'A' } }, isPending: false }))
      setActivePinia(createPinia())
      const store = useUserStore()
      await store.removeAllUserData()

      expect(blockPersistMock).toHaveBeenCalled()
    })

    it('resets all stores', async () => {
      useSessionMock.mockReturnValue(ref({ data: { user: { email: 'a@a.com', id: 'u1', image: null, name: 'A' } }, isPending: false }))
      setActivePinia(createPinia())
      const store = useUserStore()
      await store.removeAllUserData()

      expect(setTrnsMock).toHaveBeenCalledWith(null)
      expect(setCategoriesMock).toHaveBeenCalledWith(null)
      expect(setWalletsMock).toHaveBeenCalledWith(null)
      expect(trnFormResetMock).toHaveBeenCalled()
    })

    it('clears offline queue and restores userId', async () => {
      useSessionMock.mockReturnValue(ref({ data: { user: { email: 'a@a.com', id: 'u1', image: null, name: 'A' } }, isPending: false }))
      setActivePinia(createPinia())
      const store = useUserStore()
      await store.removeAllUserData()

      expect(clearOfflineQueueMock).toHaveBeenCalled()
      expect(setOfflineQueueUserIdMock).toHaveBeenCalledWith('u1')
    })

    it('calls Convex removeAllUserData action', async () => {
      useSessionMock.mockReturnValue(ref({ data: { user: { email: 'a@a.com', id: 'u1', image: null, name: 'A' } }, isPending: false }))
      setActivePinia(createPinia())
      const store = useUserStore()
      await store.removeAllUserData()

      expect(actionMock).toHaveBeenCalledWith('user.removeAllUserData', {})
    })
  })
})
