import localforage from 'localforage'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

// --- Entity-specific mocks ---

const mutationMock = vi.fn(() => Promise.resolve())
const queryMock = vi.fn(() => Promise.resolve(null))

vi.stubGlobal('useConvexClientWithApi', () => ({
  api: {
    userSettings: { get: 'userSettings.get', upsert: 'userSettings.upsert' },
  },
  client: {
    mutation: mutationMock,
    query: queryMock,
  },
}))

const setLocaleMock = vi.fn()
vi.stubGlobal('useNuxtApp', () => ({
  $i18n: { setLocale: setLocaleMock },
}))

const useSessionMock = vi.fn(() => ref({ data: null, isPending: false }))
vi.stubGlobal('useAuth', () => ({
  signOut: vi.fn(),
  useSession: useSessionMock,
}))

vi.mock('~/components/categories/useCategoriesStore', () => ({
  useCategoriesStore: () => ({
    setCategories: vi.fn(),
  }),
}))

vi.mock('~/components/trns/useTrnsStore', () => ({
  useTrnsStore: () => ({
    setTrns: vi.fn(),
  }),
}))

vi.mock('~/components/wallets/useWalletsStore', () => ({
  useWalletsStore: () => ({
    setWallets: vi.fn(),
  }),
}))

vi.mock('~/composables/useAuthCookie', () => ({
  clearAuthCookie: vi.fn(),
}))

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
        'userSettings.upsert',
        { baseCurrency: 'JPY' },
      )
    })

    it('skips Convex mutation in demo mode', async () => {
      const demoModule = await import('~/components/demo/useDemo')
      const original = demoModule.useDemo
      ;(demoModule as any).useDemo = () => ({ ...original(), isDemo: { value: true } })

      setActivePinia(createPinia())
      const store = useUserStore()
      store.saveUserBaseCurrency('GBP')

      expect(store.baseCurrency).toBe('GBP')
      expect(mutationMock).not.toHaveBeenCalled()

      ;(demoModule as any).useDemo = original
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
        'userSettings.upsert',
        { locale: 'ru' },
      )
    })

    it('skips Convex mutation in demo mode', async () => {
      const demoModule = await import('~/components/demo/useDemo')
      const original = demoModule.useDemo
      ;(demoModule as any).useDemo = () => ({ ...original(), isDemo: { value: true } })

      setActivePinia(createPinia())
      const store = useUserStore()
      store.saveUserLocale('ru')

      expect(store.locale).toBe('ru')
      expect(setLocaleMock).toHaveBeenCalledWith('ru')
      expect(mutationMock).not.toHaveBeenCalled()

      ;(demoModule as any).useDemo = original
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
})
