import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LoanItem } from '~/components/loans/types'
import type { TrnItem } from '~/components/trns/types'
import type { WalletItem } from '~/components/wallets/types'

import { useLoansStore } from '~/components/loans/useLoansStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const h = vi.hoisted(() => ({
  auth: { session: { value: null }, signOut: vi.fn(), uid: { value: 'u1' }, user: { value: null } },
  deleteRow: vi.fn(),
  demo: { value: false },
  today: Date.UTC(2026, 8, 23),
  upsertRow: vi.fn(),
  upsertRows: vi.fn(),
  watchTable: vi.fn(() => ({ abort: vi.fn() })),
}))

vi.mock('~~/services/powersync/db', () => ({ watchTable: h.watchTable }))
vi.mock('~~/services/powersync/mutations', () => ({ deleteRow: h.deleteRow, upsertRow: h.upsertRow, upsertRows: h.upsertRows }))
vi.mock('~/components/demo/useDemo', () => ({ useDemo: () => ({ isDemo: h.demo }) }))
vi.mock('~/composables/useSupabase', () => ({ useSupabase: () => ({}), useSupabaseAuth: () => h.auth }))

const TODAY = h.today
const MONTH_START = Date.UTC(2026, 8, 1)

vi.mock('~~/utils/date/civil', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~~/utils/date/civil')>()
  return { ...actual, todayCivilDayEpoch: () => h.today }
})

function wallet(over: Partial<WalletItem> = {}): WalletItem {
  return { color: '#fff', currency: 'USD', desc: '', isArchived: false, isExcludeInTotal: false, isWithdrawal: false, name: 'w', order: 0, type: 'cash', updatedAt: 1, ...over } as WalletItem
}

function loan(over: Partial<LoanItem> = {}): LoanItem {
  return {
    annualRate: 12,
    contractNumber: '',
    desc: '',
    firstPaymentDate: Date.UTC(2026, 8, 10),
    interestMethod: 'monthly',
    lateAfterDays: 3,
    overpaymentMode: 'reducePayment',
    paymentDay: 10,
    prepayWindowDays: 15,
    principalAmount: 12000,
    scheduleType: 'annuity',
    startDate: Date.UTC(2026, 7, 10),
    termMonths: 12,
    updatedAt: 1,
    walletId: 'credit1',
    ...over,
  }
}

function setup(trns: Record<string, TrnItem>, wallets: Record<string, WalletItem>) {
  useWalletsStore().setWallets(wallets)
  useTrnsStore().setTrns(trns)
  return useLoansStore()
}

describe('useLoansStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    h.demo.value = false
    h.upsertRow.mockReset().mockResolvedValue(undefined)
    h.deleteRow.mockReset().mockResolvedValue(undefined)
  })

  describe('trnsByCreditWallet', () => {
    it('takes transfers INTO a credit wallet as payments and ignores transfers out', () => {
      const store = setup({
        out: { categoryId: 'transfer', date: TODAY, expenseAmount: 300, expenseWalletId: 'credit1', incomeAmount: 300, incomeWalletId: 'cash1', type: TrnType.Transfer, updatedAt: 1 },
        repay: { categoryId: 'transfer', date: TODAY, expenseAmount: 1000, expenseWalletId: 'cash1', incomeAmount: 1000, incomeWalletId: 'credit1', type: TrnType.Transfer, updatedAt: 1 },
      }, { cash1: wallet(), credit1: wallet({ creditLimit: 0, type: 'credit' }) })

      expect(store.trnsByCreditWallet.get('credit1')).toEqual([
        { amount: 1000, date: TODAY, id: 'repay', kind: 'payment' },
      ])
      expect(store.trnsByCreditWallet.has('cash1')).toBe(false)
    })

    it('classifies expenses of a credit wallet by their reserved category and skips the rest', () => {
      const store = setup({
        fine: { amount: 30, categoryId: 'loanFine', date: TODAY, type: TrnType.Expense, updatedAt: 1, walletId: 'credit1' },
        food: { amount: 10, categoryId: 'food', date: TODAY, type: TrnType.Expense, updatedAt: 1, walletId: 'credit1' },
        interest: { amount: 200, categoryId: 'loanInterest', date: TODAY, type: TrnType.Expense, updatedAt: 1, walletId: 'credit1' },
        otherWallet: { amount: 50, categoryId: 'loanInterest', date: TODAY, type: TrnType.Expense, updatedAt: 1, walletId: 'cash1' },
      }, { cash1: wallet(), credit1: wallet({ creditLimit: 0, type: 'credit' }) })

      expect(store.trnsByCreditWallet.get('credit1')?.map(t => [t.id, t.kind])).toEqual([
        ['fine', 'fine'],
        ['interest', 'interest'],
      ])
    })

    it('sums interest and fees per month for a credit wallet with no loan row', () => {
      const store = setup({
        a: { amount: 100, categoryId: 'loanInterest', date: Date.UTC(2026, 7, 5), type: TrnType.Expense, updatedAt: 1, walletId: 'credit1' },
        b: { amount: 20, categoryId: 'loanFine', date: Date.UTC(2026, 7, 9), type: TrnType.Expense, updatedAt: 1, walletId: 'credit1' },
        c: { amount: 40, categoryId: 'loanInterest', date: Date.UTC(2026, 8, 2), type: TrnType.Expense, updatedAt: 1, walletId: 'credit1' },
      }, { cash1: wallet(), credit1: wallet({ creditLimit: 0, type: 'credit' }) })

      expect(store.costByWalletId.get('credit1')).toEqual({
        byMonth: [
          { fine: 20, interest: 100, month: Date.UTC(2026, 7, 1) },
          { fine: 0, interest: 40, month: MONTH_START },
        ],
        fine: 20,
        interest: 140,
      })
    })
  })

  describe('dueThisMonth', () => {
    it('is null without anything due', () => {
      const store = setup({}, { credit1: wallet({ creditLimit: 0, type: 'credit' }) })
      expect(store.dueThisMonth).toBeNull()
    })

    it('adds the next scheduled payment of a loan', () => {
      const store = setup({}, { credit1: wallet({ creditLimit: 0, type: 'credit' }) })
      store.setLoans({ l1: loan() })

      const due = store.dueThisMonth!
      expect(due.nearestDate).toBe(Date.UTC(2026, 8, 10))
      expect(due.amount).toBeGreaterThan(0)
    })

    it('adds the minimum payment of a credit wallet without a loan, only within the next 31 days', () => {
      const store = setup({}, {
        card: wallet({ creditLimit: 0, minPaymentAmount: 3200, minPaymentDate: Date.UTC(2026, 8, 25), minPaymentUpdatedAt: TODAY, type: 'credit' }),
        later: wallet({ creditLimit: 0, minPaymentAmount: 500, minPaymentDate: Date.UTC(2026, 10, 5), minPaymentUpdatedAt: TODAY, type: 'credit' }),
      })

      expect(store.dueThisMonth).toEqual({ amount: 3200, nearestDate: Date.UTC(2026, 8, 25) })
    })

    it('ignores the minimum payment of a wallet that has a loan row and adds the overdue row with the next one', () => {
      const store = setup({}, {
        credit1: wallet({ creditLimit: 0, minPaymentAmount: 999, minPaymentDate: Date.UTC(2026, 8, 25), minPaymentUpdatedAt: TODAY, type: 'credit' }),
      })
      store.setLoans({ l1: loan() })

      expect(store.dueThisMonth).toEqual({ amount: 2132.38, nearestDate: Date.UTC(2026, 8, 10) })
    })
  })

  describe('writes', () => {
    it('upserts a loan and rolls back when the local write fails', async () => {
      const store = setup({}, { credit1: wallet({ creditLimit: 0, type: 'credit' }) })
      store.saveLoan('l1', loan())
      expect(h.upsertRow).toHaveBeenCalledWith('loans', 'l1', expect.objectContaining({ userId: 'u1', walletId: 'credit1' }))

      h.upsertRow.mockRejectedValueOnce(new Error('nope'))
      store.saveLoan('l2', loan({ walletId: 'credit2' }))
      await new Promise<void>(resolve => setTimeout(resolve, 0))
      expect(store.items.l2).toBeUndefined()
    })

    it('deletes a loan with its own schedule rows', () => {
      const store = setup({}, { credit1: wallet({ creditLimit: 0, type: 'credit' }) })
      store.setLoans({ l1: loan() })
      store.setScheduleRows({
        other: { date: TODAY, interestPart: 1, loanId: 'l2', paymentNumber: 1, principalPart: 1, source: 'manual', totalAmount: 2, updatedAt: 1 },
        r1: { date: TODAY, interestPart: 1, loanId: 'l1', paymentNumber: 1, principalPart: 1, source: 'manual', totalAmount: 2, updatedAt: 1 },
      })

      store.deleteLoan('l1')
      expect(Object.keys(store.scheduleRows)).toEqual(['other'])
      expect(h.deleteRow).toHaveBeenCalledWith('loans', 'l1')
      expect(h.deleteRow).toHaveBeenCalledWith('loan_schedule_rows', 'r1')
    })
  })
})
