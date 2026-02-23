import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { TrnItem } from '~/components/trns/types'

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
  convexTrnsToMap: (arr: any[]) => {
    const map: Record<string, any> = {}
    for (const item of arr) {
      const { _id, ...rest } = item
      map[_id] = rest
    }
    return map
  },
}))

const mutationMock = vi.fn(() => Promise.resolve())
const queryMock = vi.fn(() => Promise.resolve(null))
const onUpdateMock = vi.fn()

// Mock Convex composables (auto-imported in Nuxt)
vi.stubGlobal('useConvexClient', () => ({
  mutation: mutationMock,
  onUpdate: onUpdateMock,
  query: queryMock,
}))
vi.stubGlobal('useConvexClientComposable', () => ({
  mutation: mutationMock,
  onUpdate: onUpdateMock,
  query: queryMock,
}))
vi.stubGlobal('asConvexId', (id: string) => id)
vi.stubGlobal('isLocalId', (id: string) => id.startsWith('local_'))
vi.stubGlobal('cleanupFrontendIds', <T>(data: Record<string, T>, pendingUpdates: Record<string, T>) => {
  const result = { ...data }
  for (const id of Object.keys(result)) {
    if (id.startsWith('local_') && !pendingUpdates[id])
      delete result[id]
  }
  return result
})
vi.stubGlobal('useConvexApi', () => ({
  api: {
    trns: { create: 'trns.create', delta: 'trns.delta', ensureSyncMeta: 'trns.ensureSyncMeta', idsHash: 'trns.idsHash', list: 'trns.list', remove: 'trns.remove', update: 'trns.update' },
  },
}))
vi.stubGlobal('useConvexClientWithApi', () => ({
  api: {
    trns: { create: 'trns.create', delta: 'trns.delta', ensureSyncMeta: 'trns.ensureSyncMeta', idsHash: 'trns.idsHash', list: 'trns.list', remove: 'trns.remove', update: 'trns.update' },
  },
  client: {
    mutation: mutationMock,
    onUpdate: onUpdateMock,
    query: queryMock,
  },
}))

// Toast & i18n auto-imports
const toastAddMock = vi.fn()
vi.stubGlobal('useToast', () => ({ add: toastAddMock }))
vi.stubGlobal('tryUseNuxtApp', () => ({ $i18n: { t: (key: string) => key } }))
vi.stubGlobal('useI18n', () => ({ t: (key: string) => key }))
vi.stubGlobal('useNuxtApp', () => ({ $i18n: { t: (key: string) => key } }))

// Emo helpers
vi.mock('~/assets/js/emo', () => ({
  errorEmo: ['😿'],
  random: (items: any[]) => items[0],
}))

// Pinia auto-imports
vi.stubGlobal('defineStore', (await import('pinia')).defineStore)
vi.stubGlobal('shallowRef', (await import('vue')).shallowRef)
vi.stubGlobal('computed', (await import('vue')).computed)

// Mock demo composable
vi.mock('~/components/demo/useDemo', () => ({
  useDemo: () => ({
    isDemo: { value: false },
  }),
}))

// Mock dependent stores
vi.mock('~/components/categories/useCategoriesStore', () => ({
  useCategoriesStore: () => ({
    getTransactibleIds: (ids: any) => ids,
    items: { food: { color: '#f00', icon: 'mdi:food', name: 'Food', parentId: 0, showInLastUsed: true, showInQuickSelector: true }, transfer: { color: '#000', icon: 'mdi:repeat', name: 'Transfer', parentId: 0, showInLastUsed: false, showInQuickSelector: false } },
    transferCategoriesIds: ['transfer'],
  }),
}))

vi.mock('~/components/wallets/useWalletsStore', () => ({
  useWalletsStore: () => ({
    items: { wallet1: { color: '#0f0', currency: 'USD', desc: '', isArchived: false, isExcludeInTotal: false, isWithdrawal: false, name: 'Cash', order: 0, type: 'cash', updatedAt: 0 } },
  }),
}))

vi.mock('~/components/offline/replay', () => ({
  isReplaying: () => false,
}))

// Mock offline helpers — spy on real implementations
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
    removeOfflineOps: vi.fn(actual.removeOfflineOps),
  }
})

// Re-import after mocks
const { useTrnsStore } = await import('~/components/trns/useTrnsStore')

// --- Helpers ---

function makeTrn(overrides: Partial<TrnItem> = {}): TrnItem {
  return {
    amount: 100,
    categoryId: 'food',
    date: 1700000000000,
    type: 0,
    updatedAt: 1700000000000,
    walletId: 'wallet1',
    ...overrides,
  } as TrnItem
}

// --- Tests ---

describe('useTrnsStore', () => {
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

  describe('saveTrn — optimistic UI', () => {
    it('updates items immediately', () => {
      const store = useTrnsStore()
      store.items = {}

      const trn = makeTrn()
      store.saveTrn({ id: 'trn1', values: trn })

      expect(store.items).toHaveProperty('trn1')
      expect(store.items!.trn1.amount).toBe(100)
    })

    it('saves to localforage', () => {
      const store = useTrnsStore()
      store.items = {}

      store.saveTrn({ id: 'trn1', values: makeTrn() })

      expect(localforageStore.get('finapp.trns')).toHaveProperty('trn1')
    })

    it('pushes to offline queue immediately', () => {
      const store = useTrnsStore()
      store.items = {}

      store.saveTrn({ id: 'trn1', values: makeTrn() })

      expect(offlineHelpers.pushOfflineOp).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'trns', id: 'trn1', type: 'create' }),
      )
    })

    it('fires Convex create mutation for new trn', () => {
      const store = useTrnsStore()
      store.items = {}

      store.saveTrn({ id: 'trn1', values: makeTrn() })

      expect(mutationMock).toHaveBeenCalledWith(
        'trns.create',
        expect.objectContaining({ amount: 100, type: 0 }),
      )
    })

    it('fires Convex update mutation for existing trn', () => {
      const store = useTrnsStore()
      store.items = { trn1: makeTrn() }

      store.saveTrn({ id: 'trn1', values: makeTrn({ amount: 200 }) })

      expect(mutationMock).toHaveBeenCalledWith(
        'trns.update',
        expect.objectContaining({ amount: 200, id: 'trn1' }),
      )
    })

    it('cleans up offline queue on mutation success', async () => {
      const store = useTrnsStore()
      store.items = {}

      store.saveTrn({ id: 'trn1', values: makeTrn() })

      // Wait for .then() to resolve
      await vi.waitFor(() => {
        expect(offlineHelpers.removeOfflineOp).toHaveBeenCalledWith('trns', 'trn1')
      })
    })

    it('keeps offline queue when mutation fails', async () => {
      // Mutation returns a never-resolving promise to simulate offline
      mutationMock.mockReturnValue(new Promise(() => {}))

      const store = useTrnsStore()
      store.items = {}

      store.saveTrn({ id: 'trn1', values: makeTrn() })

      // Give time for potential .then() — it shouldn't fire
      await new Promise(r => setTimeout(r, 10))

      expect(offlineHelpers.removeOfflineOp).not.toHaveBeenCalled()
    })

    it('adds updatedAt timestamp', () => {
      const store = useTrnsStore()
      store.items = {}
      const before = Date.now()

      store.saveTrn({ id: 'trn1', values: makeTrn() })

      expect(store.items!.trn1.updatedAt).toBeGreaterThanOrEqual(before)
    })

    it('shows toast on mutation failure', async () => {
      mutationMock.mockReturnValue(Promise.reject(new Error('network')))

      const store = useTrnsStore()
      store.items = {}

      store.saveTrn({ id: 'trn1', values: makeTrn() })

      await vi.waitFor(() => {
        expect(toastAddMock).toHaveBeenCalledWith(
          expect.objectContaining({ color: 'error', description: 'trns.errors.saveFailed' }),
        )
      })
    })
  })

  describe('deleteTrn — optimistic UI', () => {
    it('removes item from store immediately', () => {
      const store = useTrnsStore()
      store.items = { trn1: makeTrn(), trn2: makeTrn() }

      store.deleteTrn('trn1')

      expect(store.items).not.toHaveProperty('trn1')
      expect(store.items).toHaveProperty('trn2')
    })

    it('pushes to offline queue', () => {
      const store = useTrnsStore()
      store.items = { trn1: makeTrn() }

      store.deleteTrn('trn1')

      expect(offlineHelpers.pushOfflineOp).toHaveBeenCalledWith(
        expect.objectContaining({ entity: 'trns', id: 'trn1', type: 'delete' }),
      )
    })

    it('fires Convex remove mutation', () => {
      const store = useTrnsStore()
      store.items = { trn1: makeTrn() }

      store.deleteTrn('trn1')

      expect(mutationMock).toHaveBeenCalledWith('trns.remove', { id: 'trn1' })
    })

    it('cleans up offline queue on mutation success', async () => {
      const store = useTrnsStore()
      store.items = { trn1: makeTrn() }

      store.deleteTrn('trn1')

      await vi.waitFor(() => {
        expect(offlineHelpers.removeOfflineOp).toHaveBeenCalledWith('trns', 'trn1')
      })
    })

    it('shows toast on mutation failure', async () => {
      mutationMock.mockReturnValue(Promise.reject(new Error('network')))

      const store = useTrnsStore()
      store.items = { trn1: makeTrn() }

      store.deleteTrn('trn1')

      await vi.waitFor(() => {
        expect(toastAddMock).toHaveBeenCalledWith(
          expect.objectContaining({ color: 'error', description: 'trns.errors.deleteFailed' }),
        )
      })
    })
  })

  describe('deleteTrnsByIds', () => {
    it('batch deletes all trns in single mutation', () => {
      const store = useTrnsStore()
      store.items = {
        trn1: makeTrn(),
        trn2: makeTrn(),
        trn3: makeTrn(),
      }

      store.deleteTrnsByIds(['trn1', 'trn3'])

      expect(store.items).not.toHaveProperty('trn1')
      expect(store.items).toHaveProperty('trn2')
      expect(store.items).not.toHaveProperty('trn3')
      expect(mutationMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('removeTrnsFromStore', () => {
    it('removes trns from store without mutations or queue', () => {
      const store = useTrnsStore()
      store.items = {
        trn1: makeTrn(),
        trn2: makeTrn(),
        trn3: makeTrn(),
      }

      store.removeTrnsFromStore(['trn1', 'trn3'])

      expect(store.items).not.toHaveProperty('trn1')
      expect(store.items).toHaveProperty('trn2')
      expect(store.items).not.toHaveProperty('trn3')
      expect(mutationMock).not.toHaveBeenCalled()
      expect(offlineHelpers.pushOfflineOp).not.toHaveBeenCalled()
    })
  })

  describe('initTrns — sync flow', () => {
    it('performs full sync when no cached data', async () => {
      queryMock.mockImplementation((queryName: string) => {
        if (queryName === 'trns.list')
          return Promise.resolve({ continueCursor: '', isDone: true, page: [{ _id: 'trn1', amount: 100, categoryId: 'food', date: 1700000000000, type: 0, updatedAt: 1700000000000, walletId: 'wallet1' }] })
        return Promise.resolve(null)
      })

      const store = useTrnsStore()
      await store.initTrns()

      expect(store.items).toHaveProperty('trn1')
      const syncMeta = localforageStore.get('finapp.trns.syncMeta')
      // Hash is computed locally from list result, not fetched from server
      expect(syncMeta).toHaveProperty('idsHash')
      expect(syncMeta.idsHash).toBeTruthy()
      expect(syncMeta).not.toHaveProperty('serverIds')
    })

    it('performs full sync with multiple pages', async () => {
      let callCount = 0
      queryMock.mockImplementation((queryName: string) => {
        if (queryName === 'trns.list') {
          callCount++
          if (callCount === 1) {
            return Promise.resolve({ continueCursor: 'cursor1', isDone: false, page: [{ _id: 'trn1', amount: 100, categoryId: 'food', date: 1700000000000, type: 0, updatedAt: 1700000000000, walletId: 'wallet1' }] })
          }
          return Promise.resolve({ continueCursor: '', isDone: true, page: [{ _id: 'trn2', amount: 200, categoryId: 'food', date: 1700000001000, type: 0, updatedAt: 1700000001000, walletId: 'wallet1' }] })
        }
        return Promise.resolve(null)
      })

      const store = useTrnsStore()
      await store.initTrns()

      expect(store.items).toHaveProperty('trn1')
      expect(store.items).toHaveProperty('trn2')
    })

    it('performs delta sync with hash match (no deletion check)', async () => {
      // Pre-populate cache and sync meta — compute real hash for trn1
      const { xorIdsHash: computeHash } = await import('~~/utils/fnv1a')
      const hash = computeHash(['trn1'])
      localforageStore.set('finapp.trns', { trn1: makeTrn() })
      localforageStore.set('finapp.trns.syncMeta', { idsHash: hash, lastSyncedAt: 1700000000000 })

      queryMock.mockImplementation((queryName: string) => {
        if (queryName === 'trns.delta')
          return Promise.resolve({ continueCursor: '', isDone: true, page: [] })
        if (queryName === 'trns.idsHash')
          return Promise.resolve({ hash, serverTime: 1700000002000 })
        return Promise.resolve(null)
      })

      const store = useTrnsStore()
      await store.initTrns()

      expect(store.items).toHaveProperty('trn1')
    })

    it('performs delta sync with hash mismatch (falls back to fullSync)', async () => {
      // Cache has trn1 and trn2, but trn2 was deleted on server
      localforageStore.set('finapp.trns', { trn1: makeTrn(), trn2: makeTrn() })
      localforageStore.set('finapp.trns.syncMeta', { idsHash: 'old_hash', lastSyncedAt: 1700000000000 })

      queryMock.mockImplementation((queryName: string) => {
        if (queryName === 'trns.delta')
          return Promise.resolve({ continueCursor: '', isDone: true, page: [] })
        if (queryName === 'trns.idsHash')
          return Promise.resolve({ hash: 'new_hash', serverTime: 1700000002000 })
        // fullSync fallback: list returns only trn1
        if (queryName === 'trns.list')
          return Promise.resolve({ continueCursor: '', isDone: true, page: [{ _id: 'trn1', amount: 100, categoryId: 'food', date: 1700000000000, type: 0, updatedAt: 1700000000000, walletId: 'wallet1' }] })
        return Promise.resolve(null)
      })

      const store = useTrnsStore()
      await store.initTrns()

      expect(store.items).toHaveProperty('trn1')
      expect(store.items).not.toHaveProperty('trn2')
    })

    it('applies delta changes and updates hash', async () => {
      const { xorIdsHash: computeHash } = await import('~~/utils/fnv1a')
      const hash = computeHash(['trn1'])
      localforageStore.set('finapp.trns', { trn1: makeTrn({ amount: 100 }) })
      localforageStore.set('finapp.trns.syncMeta', { idsHash: hash, lastSyncedAt: 1700000000000 })

      queryMock.mockImplementation((queryName: string) => {
        if (queryName === 'trns.delta')
          return Promise.resolve({ continueCursor: '', isDone: true, page: [{ _id: 'trn1', amount: 200, categoryId: 'food', date: 1700000000000, type: 0, updatedAt: 1700000001000, walletId: 'wallet1' }] })
        if (queryName === 'trns.idsHash')
          return Promise.resolve({ hash, serverTime: 1700000002000 })
        return Promise.resolve(null)
      })

      const store = useTrnsStore()
      await store.initTrns()

      expect(store.items!.trn1.amount).toBe(200)
    })

    it('clears store when user has no trns (idsHash returns null)', async () => {
      localforageStore.set('finapp.trns', { trn1: makeTrn() })
      localforageStore.set('finapp.trns.syncMeta', { idsHash: 'old_hash', lastSyncedAt: 1700000000000 })

      queryMock.mockImplementation(() => Promise.resolve(null))

      const store = useTrnsStore()
      await store.initTrns()

      expect(store.items).toBeNull()
    })
  })

  describe('computeTrnItem', () => {
    it('returns null when store not loaded', () => {
      const store = useTrnsStore()
      store.items = false as any

      expect(store.computeTrnItem('trn1')).toBeNull()
    })

    it('returns null when trn not found', () => {
      const store = useTrnsStore()
      store.items = {}

      expect(store.computeTrnItem('nonexistent')).toBeNull()
    })

    it('returns null when category not found', () => {
      const store = useTrnsStore()
      store.items = { trn1: makeTrn({ categoryId: 'nonexistent' }) }

      expect(store.computeTrnItem('trn1')).toBeNull()
    })

    it('returns null when wallet not found', () => {
      const store = useTrnsStore()
      store.items = { trn1: makeTrn({ walletId: 'nonexistent' }) }

      expect(store.computeTrnItem('trn1')).toBeNull()
    })

    it('returns full item for regular transaction', () => {
      const store = useTrnsStore()
      store.items = { trn1: makeTrn() }

      const result = store.computeTrnItem('trn1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('trn1')
      expect(result!.category).toEqual(expect.objectContaining({ name: 'Food' }))
      expect((result as any).wallet).toEqual(expect.objectContaining({ name: 'Cash' }))
    })

    it('returns full item for transfer', () => {
      const store = useTrnsStore()
      store.items = {
        trn1: makeTrn({
          categoryId: 'transfer',
          expenseAmount: 100,
          expenseWalletId: 'wallet1',
          incomeAmount: 100,
          incomeWalletId: 'wallet1',
          type: 2,
        } as any),
      }

      const result = store.computeTrnItem('trn1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('trn1')
      expect((result as any).expenseWallet).toEqual(expect.objectContaining({ name: 'Cash' }))
      expect((result as any).incomeWallet).toEqual(expect.objectContaining({ name: 'Cash' }))
    })

    it('returns null when transfer expense wallet missing', () => {
      const store = useTrnsStore()
      store.items = {
        trn1: makeTrn({
          categoryId: 'transfer',
          expenseAmount: 100,
          expenseWalletId: 'nonexistent',
          incomeAmount: 100,
          incomeWalletId: 'wallet1',
          type: 2,
        } as any),
      }

      expect(store.computeTrnItem('trn1')).toBeNull()
    })

    it('returns null when transfer income wallet missing', () => {
      const store = useTrnsStore()
      store.items = {
        trn1: makeTrn({
          categoryId: 'transfer',
          expenseAmount: 100,
          expenseWalletId: 'wallet1',
          incomeAmount: 100,
          incomeWalletId: 'nonexistent',
          type: 2,
        } as any),
      }

      expect(store.computeTrnItem('trn1')).toBeNull()
    })
  })
})
