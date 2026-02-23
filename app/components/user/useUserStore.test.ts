import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// --- Mocks ---

const localforageStore = new Map<string, any>()
vi.mock('localforage', () => ({
  default: {
    clear: vi.fn(() => {
      localforageStore.clear()
      return Promise.resolve()
    }),
    getItem: vi.fn((key: string) => Promise.resolve(localforageStore.get(key) ?? null)),
    setItem: vi.fn((key: string, value: any) => {
      localforageStore.set(key, value)
      return Promise.resolve()
    }),
  },
}))

vi.mock('vue-deepunref', () => ({
  deepUnref: (v: any) => v,
}))

const mutationMock = vi.fn(() => Promise.resolve())
const queryMock = vi.fn(() => Promise.resolve(null))

vi.stubGlobal('useConvexClient', () => ({
  mutation: mutationMock,
  query: queryMock,
}))
vi.stubGlobal('useConvexClientComposable', () => ({
  mutation: mutationMock,
  query: queryMock,
}))
vi.stubGlobal('useConvexApi', () => ({
  api: {
    userSettings: { get: 'userSettings.get', upsert: 'userSettings.upsert' },
  },
}))
vi.stubGlobal('useConvexClientWithApi', () => ({
  api: {
    userSettings: { get: 'userSettings.get', upsert: 'userSettings.upsert' },
  },
  client: {
    mutation: mutationMock,
    query: queryMock,
  },
}))

vi.stubGlobal('defineStore', (await import('pinia')).defineStore)
const { computed, ref } = await import('vue')
vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)

const setLocaleMock = vi.fn()
vi.stubGlobal('useNuxtApp', () => ({
  $i18n: { setLocale: setLocaleMock },
}))
vi.stubGlobal('tryUseNuxtApp', () => ({ $i18n: { t: (key: string) => key } }))

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

vi.mock('~/components/demo/useDemo', () => ({
  useDemo: () => ({
    isDemo: { value: false },
  }),
}))

vi.mock('~/composables/useAuthCookie', () => ({
  clearAuthCookie: vi.fn(),
}))

const { useUserStore } = await import('~/components/user/useUserStore')

// --- Tests ---

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localforageStore.clear()
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

    it('persists to localforage', () => {
      const store = useUserStore()
      store.setUserBaseCurrency('EUR')

      const saved = localforageStore.get('finapp.userSettings')
      expect(saved).toEqual({ baseCurrency: 'EUR', locale: 'en' })
    })
  })

  describe('saveUserBaseCurrency', () => {
    it('updates ref and calls Convex mutation', () => {
      const store = useUserStore()
      store.saveUserBaseCurrency('JPY')

      expect(store.baseCurrency).toBe('JPY')
      expect(mutationMock).toHaveBeenCalledWith(
        'userSettings.upsert',
        { baseCurrency: 'JPY' },
      )
    })

    it('skips Convex mutation in demo mode', async () => {
      // Override isDemo for this test
      const demoModule = await import('~/components/demo/useDemo')
      const original = demoModule.useDemo
      ;(demoModule as any).useDemo = () => ({ ...original(), isDemo: { value: true } })

      // Need fresh store to pick up new mock
      setActivePinia(createPinia())
      const store = useUserStore()
      store.saveUserBaseCurrency('GBP')

      expect(store.baseCurrency).toBe('GBP')
      expect(mutationMock).not.toHaveBeenCalled()

      // Restore
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

    it('persists to localforage', () => {
      const store = useUserStore()
      store.setUserLocale('ru')

      const saved = localforageStore.get('finapp.userSettings')
      expect(saved).toEqual({ baseCurrency: 'USD', locale: 'ru' })
    })
  })

  describe('saveUserLocale', () => {
    it('calls Convex mutation when not in demo mode', () => {
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

      // Restore
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
    it('saves both baseCurrency and locale together', () => {
      const store = useUserStore()
      store.setUserBaseCurrency('EUR')
      store.setUserLocale('ru')

      const saved = localforageStore.get('finapp.userSettings')
      expect(saved).toEqual({ baseCurrency: 'EUR', locale: 'ru' })
    })
  })
})
