import localforage from 'localforage'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Transaction, Transfer } from '~/components/trns/types'

// --- Entity-specific mocks ---

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
const queryMock = vi.fn<(...args: any[]) => Promise<any>>(() => Promise.resolve(null))
const onUpdateMock = vi.fn()

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

vi.mock('~/components/categories/useCategoriesStore', () => ({
  useCategoriesStore: () => ({
    getTransactibleIds: (ids: any) => ids,
    items: { food: { color: '#f00', icon: 'mdi:food', name: 'Food', parentId: 0, showInLastUsed: true, showInQuickSelector: true }, transfer: { color: '#000', icon: 'mdi:repeat', name: 'Transfer', parentId: 0, showInLastUsed: false, showInQuickSelector: false } },
  }),
}))

vi.mock('~/components/wallets/useWalletsStore', () => ({
  useWalletsStore: () => ({
    items: { wallet1: { color: '#0f0', currency: 'USD', desc: '', isArchived: false, isExcludeInTotal: false, isWithdrawal: false, name: 'Cash', order: 0, type: 'cash', updatedAt: 0 } },
  }),
}))

const offlineHelpers = await import('~/components/offline/helpers')
vi.mock('~/components/offline/helpers', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('~/components/offline/helpers')
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

const { useTrnsStore } = await import('~/components/trns/useTrnsStore')

// --- Helpers ---

function makeTrn(overrides: Partial<Transaction> = {}): Transaction {
  return {
    amount: 100,
    categoryId: 'food',
    date: 1700000000000,
    type: 0,
    updatedAt: 1700000000000,
    walletId: 'wallet1',
    ...overrides,
  }
}

function makeTransfer(overrides: Partial<Transfer> = {}): Transfer {
  return {
    categoryId: 'transfer',
    date: 1700000000000,
    expenseAmount: 100,
    expenseWalletId: 'wallet1',
    incomeAmount: 100,
    incomeWalletId: 'wallet1',
    type: 2,
    updatedAt: 1700000000000,
    ...overrides,
  }
}

// --- Tests ---

describe('useTrnsStore', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    await localforage.clear()
    vi.clearAllMocks()
    mutationMock.mockReturnValue(Promise.resolve())
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
      const trn1 = store.items!.trn1!
      expect(trn1.type).not.toBe(2)
      if (trn1.type !== 2)
        expect(trn1.amount).toBe(100)
    })

    it('saves to localforage', async () => {
      const store = useTrnsStore()
      store.items = {}

      store.saveTrn({ id: 'trn1', values: makeTrn() })

      const saved = await localforage.getItem<any>('finapp.trns')
      expect(saved).toHaveProperty('trn1')
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

      await vi.waitFor(() => {
        expect(offlineHelpers.removeOfflineOp).toHaveBeenCalledWith('trns', 'trn1')
      })
    })

    it('keeps offline queue when mutation fails', async () => {
      mutationMock.mockReturnValue(new Promise(() => {}))

      const store = useTrnsStore()
      store.items = {}

      store.saveTrn({ id: 'trn1', values: makeTrn() })

      await new Promise(r => setTimeout(r, 10))

      expect(offlineHelpers.removeOfflineOp).not.toHaveBeenCalled()
    })

    it('adds updatedAt timestamp', () => {
      const store = useTrnsStore()
      store.items = {}
      const before = Date.now()

      store.saveTrn({ id: 'trn1', values: makeTrn() })

      expect(store.items!.trn1!.updatedAt).toBeGreaterThanOrEqual(before)
    })

    it('shows toast on mutation failure', async () => {
      const { toastAddMock } = await import('~/test-utils/setup-store')
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
      const { toastAddMock } = await import('~/test-utils/setup-store')
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
      const syncMeta = await localforage.getItem<any>('finapp.trns.syncMeta')
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
      const { xorIdsHash: computeHash } = await import('~~/utils/fnv1a')
      const hash = computeHash(['trn1'])
      await localforage.setItem('finapp.trns', { trn1: makeTrn() })
      await localforage.setItem('finapp.trns.syncMeta', { idsHash: hash, lastSyncedAt: 1700000000000 })

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
      await localforage.setItem('finapp.trns', { trn1: makeTrn(), trn2: makeTrn() })
      await localforage.setItem('finapp.trns.syncMeta', { idsHash: 'old_hash', lastSyncedAt: 1700000000000 })

      queryMock.mockImplementation((queryName: string) => {
        if (queryName === 'trns.delta')
          return Promise.resolve({ continueCursor: '', isDone: true, page: [] })
        if (queryName === 'trns.idsHash')
          return Promise.resolve({ hash: 'new_hash', serverTime: 1700000002000 })
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
      await localforage.setItem('finapp.trns', { trn1: makeTrn({ amount: 100 }) })
      await localforage.setItem('finapp.trns.syncMeta', { idsHash: hash, lastSyncedAt: 1700000000000 })

      queryMock.mockImplementation((queryName: string) => {
        if (queryName === 'trns.delta')
          return Promise.resolve({ continueCursor: '', isDone: true, page: [{ _id: 'trn1', amount: 200, categoryId: 'food', date: 1700000000000, type: 0, updatedAt: 1700000001000, walletId: 'wallet1' }] })
        if (queryName === 'trns.idsHash')
          return Promise.resolve({ hash, serverTime: 1700000002000 })
        return Promise.resolve(null)
      })

      const store = useTrnsStore()
      await store.initTrns()

      const trn1 = store.items!.trn1!
      expect(trn1.type).not.toBe(2)
      if (trn1.type !== 2)
        expect(trn1.amount).toBe(200)
    })

    it('clears store when user has no trns (idsHash returns null)', async () => {
      await localforage.setItem('finapp.trns', { trn1: makeTrn() })
      await localforage.setItem('finapp.trns.syncMeta', { idsHash: 'old_hash', lastSyncedAt: 1700000000000 })

      queryMock.mockImplementation(() => Promise.resolve(null))

      const store = useTrnsStore()
      await store.initTrns()

      expect(store.items).toBeNull()
    })
  })

  describe('computeTrnItem', () => {
    it('returns null when store not loaded', () => {
      const store = useTrnsStore()
      store.items = null

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
      expect(result!.type).not.toBe(2)
      if (result!.type !== 2)
        expect(result!.wallet).toEqual(expect.objectContaining({ name: 'Cash' }))
    })

    it('returns full item for transfer', () => {
      const store = useTrnsStore()
      store.items = {
        trn1: makeTransfer(),
      }

      const result = store.computeTrnItem('trn1')
      expect(result).not.toBeNull()
      expect(result!.id).toBe('trn1')
      expect(result!.type).toBe(2)
      if (result!.type === 2) {
        expect(result!.expenseWallet).toEqual(expect.objectContaining({ name: 'Cash' }))
        expect(result!.incomeWallet).toEqual(expect.objectContaining({ name: 'Cash' }))
      }
    })

    it('returns null when transfer expense wallet missing', () => {
      const store = useTrnsStore()
      store.items = {
        trn1: makeTransfer({ expenseWalletId: 'nonexistent' }),
      }

      expect(store.computeTrnItem('trn1')).toBeNull()
    })

    it('returns null when transfer income wallet missing', () => {
      const store = useTrnsStore()
      store.items = {
        trn1: makeTransfer({ incomeWalletId: 'nonexistent' }),
      }

      expect(store.computeTrnItem('trn1')).toBeNull()
    })
  })
})
