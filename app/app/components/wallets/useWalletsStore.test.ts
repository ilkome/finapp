import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { TrnItem } from '~/components/trns/types'
import type { WalletItem } from '~/components/wallets/types'

import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { toastAddMock } from '~/test-utils/setup-store'

const h = vi.hoisted(() => {
  const watchCallbacks: ((rows: any[]) => void)[] = []
  return {
    auth: { session: { value: null }, signOut: vi.fn(), uid: { value: 'u1' }, user: { value: null } },
    deleteRow: vi.fn(),
    demo: { value: false },
    upsertRow: vi.fn(),
    upsertRows: vi.fn(),
    watchCallbacks,
    watchTable: vi.fn((_sql: string, _params: unknown[], cb: (rows: any[]) => void) => {
      watchCallbacks.push(cb)
      return { abort: vi.fn() }
    }),
  }
})

vi.mock('~~/services/powersync/db', () => ({ watchTable: h.watchTable }))
vi.mock('~~/services/powersync/mutations', () => ({ deleteRow: h.deleteRow, upsertRow: h.upsertRow, upsertRows: h.upsertRows }))
vi.mock('~/components/demo/useDemo', () => ({ useDemo: () => ({ isDemo: h.demo }) }))
vi.mock('~/composables/useSupabase', () => ({ useSupabase: () => ({}), useSupabaseAuth: () => h.auth }))

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0))

function wallet(over: Partial<WalletItem> = {}): WalletItem {
  return { color: '#fff', currency: 'USD', desc: '', isArchived: false, isExcludeInTotal: false, isWithdrawal: false, name: 'Cash', order: 0, type: 'cash', updatedAt: 1, ...over } as WalletItem
}

function walletRow(id: string, order = 0) {
  return { color: '#fff', currency: 'USD', desc: '', id, isArchived: 0, isExcludeInTotal: 0, isWithdrawal: 0, name: id, order, type: 'cash', updatedAt: 1 }
}

function expense(over: Partial<TrnItem> = {}): TrnItem {
  return { amount: 100, categoryId: 'food', date: 1700000000000, type: TrnType.Expense, updatedAt: 1, walletId: 'w1', ...over } as TrnItem
}

describe('useWalletsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    h.demo.value = false
    h.watchCallbacks.length = 0
    h.watchTable.mockClear()
    h.upsertRow.mockReset().mockResolvedValue(undefined)
    h.upsertRows.mockReset().mockResolvedValue(undefined)
    h.deleteRow.mockReset().mockResolvedValue(undefined)
    toastAddMock.mockClear()
  })

  describe('hydration via watch', () => {
    it('subscribes to the wallets table and maps row snapshots', () => {
      const store = useWalletsStore()
      store.initWallets()

      expect(h.watchTable).toHaveBeenCalledTimes(1)
      expect(h.watchTable.mock.calls[0]?.[0]).toBe('SELECT * FROM wallets')

      h.watchCallbacks[0]!([walletRow('a', 0), walletRow('b', 1)])
      expect(Object.keys(store.items ?? {})).toEqual(['a', 'b'])
      expect(store.items?.a).toMatchObject({ currency: 'USD', type: 'cash' })

      // An empty emission after the first one is a genuine wipe and must apply.
      h.watchCallbacks[0]!([])
      expect(store.items).toBeNull()
    })

    it('keeps primed items on an empty FIRST emission (sync not landed yet)', () => {
      const store = useWalletsStore()
      store.initWallets()

      store.setWallets({ a: { currency: 'USD', name: 'A', order: 0, type: 'cash' } } as never)
      h.watchCallbacks[0]!([])
      expect(store.items?.a).toBeDefined()
    })

    it('flips isLoaded on the first emission and resets it on re-subscribe', () => {
      const store = useWalletsStore()
      expect(store.isLoaded).toBe(false)

      store.initWallets()
      expect(store.isLoaded).toBe(false) // armed but no emission yet

      h.watchCallbacks[0]!([]) // even an empty emission counts as hydrated
      expect(store.isLoaded).toBe(true)

      store.initWallets() // re-subscribe (e.g. a different user) waits again
      expect(store.isLoaded).toBe(false)
    })
  })

  describe('saveWallet', () => {
    it('assigns the next order to a new wallet and upserts it', async () => {
      const store = useWalletsStore()
      store.setWallets({ w1: wallet({ order: 0 }) })

      store.saveWallet({ id: 'w2', values: wallet({ name: 'Card' }) })
      expect(store.items?.w2).toMatchObject({ name: 'Card', order: 1 }) // maxOrder + 1

      await tick()
      expect(h.upsertRow).toHaveBeenCalledWith('wallets', 'w2', expect.objectContaining({ order: 1, userId: 'u1' }))
    })

    it('rolls back and toasts when the write fails', async () => {
      const store = useWalletsStore()
      store.setWallets({ w1: wallet({ order: 0 }) })
      const prev = store.items
      h.upsertRow.mockReset().mockRejectedValueOnce(new Error('boom'))

      store.saveWallet({ id: 'w2', values: wallet() })
      expect(store.items?.w2).toBeDefined()

      await tick()
      expect(store.items).toBe(prev)
      expect(store.items?.w2).toBeUndefined()
      expect(toastAddMock).toHaveBeenCalledTimes(1)
    })

    it('does not touch PowerSync in demo mode', async () => {
      h.demo.value = true
      const store = useWalletsStore()
      store.setWallets({ w1: wallet() })
      store.saveWallet({ id: 'w2', values: wallet() })

      await tick()
      expect(h.upsertRow).not.toHaveBeenCalled()
    })
  })

  describe('saveWalletsOrder', () => {
    it('reorders optimistically and upserts every wallet', async () => {
      const store = useWalletsStore()
      store.setWallets({ a: wallet({ order: 0 }), b: wallet({ order: 1 }) })

      store.saveWalletsOrder(['b', 'a'])
      expect(store.items?.b?.order).toBe(0)
      expect(store.items?.a?.order).toBe(1)

      await tick()
      expect(h.upsertRows).toHaveBeenCalledTimes(1)
      const rows = h.upsertRows.mock.calls[0]?.[1] as { id: string }[]
      expect(rows.map(r => r.id)).toEqual(['b', 'a'])
    })

    it('restores the previous order and toasts when the write fails', async () => {
      const store = useWalletsStore()
      store.setWallets({ a: wallet({ order: 0 }), b: wallet({ order: 1 }) })
      const prev = store.items
      h.upsertRows.mockReset().mockRejectedValueOnce(new Error('boom'))

      store.saveWalletsOrder(['b', 'a'])
      await tick()

      expect(store.items).toBe(prev)
      expect(toastAddMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteWallet', () => {
    it('cascades: removes the wallet and its trns, deleting both in the DB', async () => {
      const trnsStore = useTrnsStore()
      trnsStore.setTrns({ t1: expense(), t2: expense({ walletId: 'w2' }) })
      const store = useWalletsStore()
      store.setWallets({ w1: wallet() })

      await store.deleteWallet('w1', ['t1'])

      expect(store.items?.w1).toBeUndefined()
      expect(trnsStore.items?.t1).toBeUndefined()
      expect(trnsStore.items?.t2).toBeDefined()
      expect(h.deleteRow).toHaveBeenCalledWith('wallets', 'w1')
      expect(h.deleteRow).toHaveBeenCalledWith('trns', 't1')
    })

    it('restores the wallet and cascaded trns when the write fails', async () => {
      const trnsStore = useTrnsStore()
      const seededTrns = { t1: expense() }
      trnsStore.setTrns(seededTrns)
      const store = useWalletsStore()
      store.setWallets({ w1: wallet() })
      const prevWallets = store.items
      h.deleteRow.mockReset().mockRejectedValueOnce(new Error('boom'))

      await store.deleteWallet('w1', ['t1'])

      expect(store.items).toBe(prevWallets)
      expect(store.items?.w1).toBeDefined()
      expect(trnsStore.items).toBe(seededTrns)
      expect(trnsStore.items?.t1).toBeDefined()
      expect(toastAddMock).toHaveBeenCalledTimes(1)
    })

    it('does not touch PowerSync in demo mode', async () => {
      h.demo.value = true
      const trnsStore = useTrnsStore()
      trnsStore.setTrns({ t1: expense() })
      const store = useWalletsStore()
      store.setWallets({ w1: wallet() })

      await store.deleteWallet('w1', ['t1'])

      expect(store.items?.w1).toBeUndefined()
      expect(trnsStore.items?.t1).toBeUndefined()
      expect(h.deleteRow).not.toHaveBeenCalled()
    })
  })
})
