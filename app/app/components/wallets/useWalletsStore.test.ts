import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LoanItem } from '~/components/loans/types'
import type { TrnItem } from '~/components/trns/types'
import type { WalletItem } from '~/components/wallets/types'

import { useBankReportsStore } from '~/components/bankReports/useBankReportsStore'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { toastAddMock } from '~/test-utils/setup-store'

const h = vi.hoisted(() => {
  const watchCallbacks: ((rows: any[]) => void)[] = []
  return {
    auth: { session: { value: null }, signOut: vi.fn(), uid: { value: 'u1' }, user: { value: null } },
    deleteRow: vi.fn(),
    deleteRows: vi.fn(),
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
vi.mock('~~/services/powersync/mutations', () => ({ deleteRow: h.deleteRow, deleteRows: h.deleteRows, upsertRow: h.upsertRow, upsertRows: h.upsertRows }))
vi.mock('~/components/demo/useDemo', () => ({ useDemo: () => ({ isDemo: h.demo }) }))
vi.mock('~/composables/useSupabase', () => ({ useSupabase: () => ({}), useSupabaseAuth: () => h.auth }))

const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0))

function wallet(over: Partial<WalletItem> = {}): WalletItem {
  return { color: '#fff', currencyCode: 'USD', description: '', isArchived: false, isExcludedFromTotal: false, isWithdrawable: false, name: 'Cash', sortOrder: 0, type: 'cash', updatedAt: 1, ...over } as WalletItem
}

function walletRow(id: string, order = 0) {
  return { color: '#fff', currency_code: 'USD', description: '', id, isArchived: 0, isExcludedFromTotal: 0, isWithdrawable: 0, name: id, sort_order: order, type: 'cash', updatedAt: 1 }
}

function expense(over: Partial<TrnItem> = {}): TrnItem {
  return { categoryId: 'food', createdAt: 1, date: 1700000000000, fromAmount: 100, fromWalletId: 'w1', type: 'expense', updatedAt: 1, ...over } as TrnItem
}

describe('useWalletsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    h.demo.value = false
    h.watchCallbacks.length = 0
    h.upsertRow.mockReset().mockResolvedValue(undefined)
    h.upsertRows.mockReset().mockResolvedValue(undefined)
    h.deleteRow.mockReset().mockResolvedValue(undefined)
    h.deleteRows.mockReset().mockResolvedValue(undefined)
  })

  describe('hydration via watch', () => {
    it('subscribes to the wallets table and maps row snapshots', () => {
      const store = useWalletsStore()
      store.initWallets()

      expect(h.watchTable).toHaveBeenCalledTimes(1)
      expect(h.watchTable.mock.calls[0]?.[0]).toBe('SELECT * FROM wallets')

      h.watchCallbacks[0]!([walletRow('a', 0), walletRow('b', 1)])
      expect(Object.keys(store.items ?? {})).toEqual(['a', 'b'])
      expect(store.items?.a).toMatchObject({ currencyCode: 'USD', type: 'cash' })

      // An empty emission after the first one is a genuine wipe and must apply.
      h.watchCallbacks[0]!([])
      expect(store.items).toBeNull()
    })

    it('keeps primed items on an empty FIRST emission (sync not landed yet)', () => {
      const store = useWalletsStore()
      store.initWallets()

      store.setWallets({ a: { currencyCode: 'USD', name: 'A', sortOrder: 0, type: 'cash' } } as never)
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
      store.setWallets({ w1: wallet({ sortOrder: 0 }) })

      store.saveWallet({ id: 'w2', values: wallet({ name: 'Card' }) })
      expect(store.items?.w2).toMatchObject({ name: 'Card', sortOrder: 1 }) // maxOrder + 1

      await tick()
      expect(h.upsertRow).toHaveBeenCalledWith('wallets', 'w2', expect.objectContaining({ sort_order: 1, user_id: 'u1' }))
    })

    it('rolls back and toasts when the write fails', async () => {
      const store = useWalletsStore()
      store.setWallets({ w1: wallet({ sortOrder: 0 }) })
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
      store.setWallets({ a: wallet({ sortOrder: 0 }), b: wallet({ sortOrder: 1 }) })

      store.saveWalletsOrder(['b', 'a'])
      expect(store.items?.b?.sortOrder).toBe(0)
      expect(store.items?.a?.sortOrder).toBe(1)

      await tick()
      expect(h.upsertRows).toHaveBeenCalledTimes(1)
      const rows = h.upsertRows.mock.calls[0]?.[1] as { id: string }[]
      expect(rows.map(r => r.id)).toEqual(['b', 'a'])
    })

    it('restores the previous order and toasts when the write fails', async () => {
      const store = useWalletsStore()
      store.setWallets({ a: wallet({ sortOrder: 0 }), b: wallet({ sortOrder: 1 }) })
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
      trnsStore.setTrns({ t1: expense(), t2: expense({ fromWalletId: 'w2' }) })
      const store = useWalletsStore()
      store.setWallets({ w1: wallet() })

      await store.deleteWallet('w1', ['t1'])

      expect(store.items?.w1).toBeUndefined()
      expect(trnsStore.items?.t1).toBeUndefined()
      expect(trnsStore.items?.t2).toBeDefined()
      expect(h.deleteRow).toHaveBeenCalledWith('wallets', 'w1')
      expect(h.deleteRows).toHaveBeenCalledWith('transactions', ['t1'])
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

    it('cascades to the loan of a deleted credit wallet', async () => {
      const store = useWalletsStore()
      store.setWallets({ credit1: wallet({ type: 'credit_card' }) })
      const loansStore = useLoansStore()
      loansStore.setLoans({ credit1: { walletId: 'credit1' } as LoanItem })
      loansStore.setScheduleOverrides({ 'credit1:1': { loanId: 'credit1' } as never })
      useBankReportsStore().setBankReports({ credit1: { createdAt: 1, minPaymentAmount: 100, updatedAt: 1 } })

      await store.deleteWallet('credit1')

      expect(loansStore.items.credit1).toBeUndefined()
      expect(Object.keys(loansStore.scheduleOverrides)).toEqual([])
      expect(h.deleteRow).toHaveBeenCalledWith('loans', 'credit1')
      expect(h.deleteRows).toHaveBeenCalledWith('loan_schedule_overrides', ['credit1:1'])
      expect(h.deleteRow).toHaveBeenCalledWith('bank_reports', 'credit1')
    })

    it('drops the loan when its wallet is retyped away from a credit product', () => {
      const store = useWalletsStore()
      store.setWallets({ credit1: wallet({ type: 'loan' }) })
      const loansStore = useLoansStore()
      loansStore.setLoans({ credit1: { walletId: 'credit1' } as LoanItem })

      store.saveWallet({ id: 'credit1', values: wallet({ type: 'cash' }) })

      expect(loansStore.items.credit1).toBeUndefined()
    })
  })

  describe('itemsComputed', () => {
    it('keeps the objects of wallets a trn change did not touch', () => {
      const store = useWalletsStore()
      const trnsStore = useTrnsStore()
      store.setWallets({ w1: wallet({ sortOrder: 0 }), w2: wallet({ sortOrder: 1 }) })
      trnsStore.setTrns({ t1: expense() })
      const before = store.itemsComputed

      trnsStore.setTrns({ t1: expense(), t2: expense({ fromAmount: 50 }) })
      const after = store.itemsComputed

      expect(after.w2).toBe(before.w2)
      expect(after.w1).not.toBe(before.w1)
      expect(after.w1?.amount).toBe(-150)
    })
  })
})
