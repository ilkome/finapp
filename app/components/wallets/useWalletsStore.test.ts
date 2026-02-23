import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { WalletItem } from '~/components/wallets/types'

// --- Mocks ---

const localforageStore = new Map<string, any>()
vi.mock('localforage', () => ({
  default: {
    getItem: vi.fn((key: string) => Promise.resolve(localforageStore.get(key) ?? null)),
    removeItem: vi.fn((key: string) => {
      localforageStore.delete(key)
      return Promise.resolve()
    }),
    setItem: vi.fn((key: string, value: any) => {
      localforageStore.set(key, value)
      return Promise.resolve()
    }),
  },
}))

vi.mock('@vueuse/core', () => ({
  useDebounceFn: (fn: (...args: any[]) => any) => fn,
}))

vi.mock('vue-deepunref', () => ({
  deepUnref: (v: any) => v,
}))

vi.mock('~~/services/convex/api', () => ({
  convexWalletsToMap: (v: any) => v,
}))

vi.mock('~~/utils/simple', () => ({
  uniqueElementsBy: () => [],
}))

const mutationMock = vi.fn(() => Promise.resolve())
const onUpdateMock = vi.fn()

vi.stubGlobal('useConvexClient', () => ({
  mutation: mutationMock,
  onUpdate: onUpdateMock,
}))
vi.stubGlobal('useConvexClientComposable', () => ({
  mutation: mutationMock,
  onUpdate: onUpdateMock,
}))
vi.stubGlobal('asConvexId', (id: string) => id)
vi.stubGlobal('isLocalId', (id: string) => id.startsWith('local_'))
vi.stubGlobal('useConvexApi', () => ({
  api: {
    wallets: { create: 'wallets.create', list: 'wallets.list', remove: 'wallets.remove', update: 'wallets.update', updateOrder: 'wallets.updateOrder' },
  },
}))
vi.stubGlobal('useConvexClientWithApi', () => ({
  api: {
    wallets: { create: 'wallets.create', list: 'wallets.list', remove: 'wallets.remove', update: 'wallets.update', updateOrder: 'wallets.updateOrder' },
  },
  client: {
    mutation: mutationMock,
    onUpdate: onUpdateMock,
  },
}))

const toastAddMock = vi.fn()
vi.stubGlobal('useToast', () => ({ add: toastAddMock }))
vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
vi.stubGlobal('useNuxtApp', () => ({ $i18n: { t: (key: string) => key } }))
vi.stubGlobal('tryUseNuxtApp', () => ({ $i18n: { t: (key: string) => key } }))

vi.mock('~/assets/js/emo', () => ({
  errorEmo: ['😿'],
  random: (items: any[]) => items[0],
}))

vi.stubGlobal('defineStore', (await import('pinia')).defineStore)
const { computed, ref, shallowRef } = await import('vue')
vi.stubGlobal('computed', computed)
vi.stubGlobal('ref', ref)
vi.stubGlobal('shallowRef', shallowRef)

const removeTrnsFromStoreMock = vi.fn()
vi.mock('~/components/trns/useTrnsStore', () => ({
  useTrnsStore: () => ({
    deleteTrnsByIds: vi.fn(),
    getStoreTrnsIds: () => [],
    items: {},
    removeTrnsFromStore: removeTrnsFromStoreMock,
  }),
}))

vi.mock('~/components/currencies/useCurrenciesStore', () => ({
  useCurrenciesStore: () => ({
    base: 'USD',
    rates: {},
  }),
}))

vi.mock('~/components/user/useUserStore', () => ({
  useUserStore: () => ({
    baseCurrency: 'USD',
    saveUserBaseCurrency: vi.fn(),
  }),
}))

vi.mock('~/components/demo/useDemo', () => ({
  useDemo: () => ({
    isDemo: { value: false },
  }),
}))

vi.mock('~/components/offline/replay', () => ({
  isReplaying: () => false,
}))

const offlineHelpers = await import('~/components/offline/helpers')
vi.mock('~/components/offline/helpers', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    clearOfflineQueue: vi.fn(actual.clearOfflineQueue),
    getAllOfflineOps: vi.fn(actual.getAllOfflineOps),
    getOfflineOpsByEntity: vi.fn(actual.getOfflineOpsByEntity),
    pushOfflineOp: vi.fn(actual.pushOfflineOp),
    removeOfflineOp: vi.fn(actual.removeOfflineOp),
    removeOfflineOpByType: vi.fn(actual.removeOfflineOpByType),
  }
})

const { useWalletsStore } = await import('~/components/wallets/useWalletsStore')

// --- Helpers ---

function makeWallet(overrides: Partial<WalletItem> = {}): WalletItem {
  return {
    color: '#0f0',
    currency: 'USD',
    desc: '',
    isArchived: false,
    isExcludeInTotal: false,
    isWithdrawal: false,
    name: 'Cash',
    order: 0,
    type: 'cash',
    updatedAt: 1700000000000,
    ...overrides,
  } as WalletItem
}

// --- Tests ---

describe('useWalletsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localforageStore.clear()
    vi.clearAllMocks()
    mutationMock.mockReturnValue(Promise.resolve())
    toastAddMock.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('saveWallet — optimistic UI', () => {
    it('updates items immediately', () => {
      const store = useWalletsStore()
      store.items = {}

      store.saveWallet({ id: 'w1', values: makeWallet() })

      expect(store.items).toHaveProperty('w1')
      expect(store.items!.w1.name).toBe('Cash')
    })

    it('saves to localforage', () => {
      const store = useWalletsStore()
      store.items = {}

      store.saveWallet({ id: 'w1', values: makeWallet() })

      expect(localforageStore.get('finapp.wallets')).toHaveProperty('w1')
    })

    it('pushes to offline queue immediately', () => {
      const store = useWalletsStore()
      store.items = {}

      store.saveWallet({ id: 'w1', values: makeWallet() })

      expect(offlineHelpers.pushOfflineOp).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'wallets', id: 'w1', type: 'create' }),
      )
    })

    it('fires Convex create mutation for new wallet', () => {
      const store = useWalletsStore()
      store.items = {}

      store.saveWallet({ id: 'w1', values: makeWallet() })

      expect(mutationMock).toHaveBeenCalledWith(
        'wallets.create',
        expect.objectContaining({ currency: 'USD', name: 'Cash' }),
      )
    })

    it('fires Convex update mutation for existing wallet', () => {
      const store = useWalletsStore()
      store.items = { w1: makeWallet() }

      store.saveWallet({ id: 'w1', values: makeWallet({ name: 'Updated Cash' }) })

      expect(mutationMock).toHaveBeenCalledWith(
        'wallets.update',
        expect.objectContaining({ id: 'w1', name: 'Updated Cash' }),
      )
    })

    it('cleans up offline queue on mutation success', async () => {
      const store = useWalletsStore()
      store.items = {}

      store.saveWallet({ id: 'w1', values: makeWallet() })

      await vi.waitFor(() => {
        expect(offlineHelpers.removeOfflineOp).toHaveBeenCalledWith('wallets', 'w1')
      })
    })

    it('keeps offline queue when mutation pending', async () => {
      mutationMock.mockReturnValue(new Promise(() => {}))

      const store = useWalletsStore()
      store.items = {}

      store.saveWallet({ id: 'w1', values: makeWallet() })

      await new Promise(r => setTimeout(r, 10))

      expect(offlineHelpers.removeOfflineOp).not.toHaveBeenCalled()
    })

    it('shows toast on mutation failure', async () => {
      mutationMock.mockReturnValue(Promise.reject(new Error('network')))

      const store = useWalletsStore()
      store.items = {}

      store.saveWallet({ id: 'w1', values: makeWallet() })

      await vi.waitFor(() => {
        expect(toastAddMock).toHaveBeenCalledWith(
          expect.objectContaining({ color: 'error', description: 'wallets.errors.saveFailed' }),
        )
      })
    })
  })

  describe('deleteWallet — optimistic UI', () => {
    it('removes item from store immediately', () => {
      const store = useWalletsStore()
      store.items = { w1: makeWallet(), w2: makeWallet({ name: 'Card' }) }

      store.deleteWallet('w1')

      expect(store.items).not.toHaveProperty('w1')
      expect(store.items).toHaveProperty('w2')
    })

    it('pushes to offline queue', () => {
      const store = useWalletsStore()
      store.items = { w1: makeWallet() }

      store.deleteWallet('w1')

      expect(offlineHelpers.pushOfflineOp).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'wallets', id: 'w1', type: 'delete' }),
      )
    })

    it('fires Convex remove mutation', () => {
      const store = useWalletsStore()
      store.items = { w1: makeWallet() }

      store.deleteWallet('w1')

      expect(mutationMock).toHaveBeenCalledWith('wallets.remove', { id: 'w1' })
    })

    it('cleans up offline queue on mutation success', async () => {
      const store = useWalletsStore()
      store.items = { w1: makeWallet() }

      store.deleteWallet('w1')

      await vi.waitFor(() => {
        expect(offlineHelpers.removeOfflineOp).toHaveBeenCalledWith('wallets', 'w1')
      })
    })

    it('removes trns from store immediately (optimistic)', () => {
      const store = useWalletsStore()
      store.items = { w1: makeWallet() }

      store.deleteWallet('w1', ['trn1', 'trn2'])

      expect(removeTrnsFromStoreMock).toHaveBeenCalledWith(['trn1', 'trn2'])
    })

    it('shows toast on delete mutation failure', async () => {
      mutationMock.mockReturnValue(Promise.reject(new Error('network')))
      const store = useWalletsStore()
      store.items = { w1: makeWallet() }

      store.deleteWallet('w1')

      await vi.waitFor(() => {
        expect(toastAddMock).toHaveBeenCalledWith(
          expect.objectContaining({ color: 'error', description: 'wallets.errors.deleteFailed' }),
        )
      })
    })
  })

  describe('saveWalletsOrder', () => {
    it('updates order in store optimistically', () => {
      const store = useWalletsStore()
      store.items = {
        w1: makeWallet({ name: 'First', order: 0 }),
        w2: makeWallet({ name: 'Second', order: 1 }),
      }

      // Reorder: w2 first, w1 second
      mutationMock.mockReturnValue(new Promise(() => {})) // never resolves
      store.saveWalletsOrder(['w2', 'w1'])

      expect(store.items!.w2.order).toBe(0)
      expect(store.items!.w1.order).toBe(1)
    })

    it('fires atomic updateOrder mutation', () => {
      const store = useWalletsStore()
      store.items = {
        w1: makeWallet({ name: 'First', order: 0 }),
        w2: makeWallet({ name: 'Second', order: 1 }),
      }

      store.saveWalletsOrder(['w2', 'w1'])

      expect(mutationMock).toHaveBeenCalledWith('wallets.updateOrder', {
        orders: [
          { id: 'w2', order: 0 },
          { id: 'w1', order: 1 },
        ],
      })
    })

    it('shows toast on failure', async () => {
      mutationMock.mockReturnValue(Promise.reject(new Error('network')))

      const store = useWalletsStore()
      store.items = {
        w1: makeWallet({ order: 0 }),
        w2: makeWallet({ order: 1 }),
      }

      store.saveWalletsOrder(['w2', 'w1'])
      await vi.waitFor(() => {
        expect(toastAddMock).toHaveBeenCalledWith(
          expect.objectContaining({ color: 'error', description: 'wallets.errors.orderFailed' }),
        )
      })
    })
  })

  describe('saveWallet — new wallet order', () => {
    it('sets order to max+1 for new wallets', () => {
      const store = useWalletsStore()
      store.items = {
        w1: makeWallet({ order: 0 }),
        w2: makeWallet({ order: 3 }),
      }

      store.saveWallet({ id: 'w3', values: makeWallet({ order: 0 }) })

      expect(store.items!.w3.order).toBe(4)
    })

    it('does not change order for existing wallets', () => {
      const store = useWalletsStore()
      store.items = {
        w1: makeWallet({ order: 0 }),
        w2: makeWallet({ order: 3 }),
      }

      store.saveWallet({ id: 'w1', values: makeWallet({ order: 5 }) })

      expect(store.items!.w1.order).toBe(5)
    })
  })
})
