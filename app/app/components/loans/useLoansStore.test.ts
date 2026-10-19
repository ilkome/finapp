import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LoanItem } from '~/components/loans/types'
import type { TrnItem } from '~/components/trns/types'
import type { WalletItem } from '~/components/wallets/types'

import { useBankReportsStore } from '~/components/bankReports/useBankReportsStore'
import { useLoansStore } from '~/components/loans/useLoansStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const h = vi.hoisted(() => ({
  auth: { session: { value: null }, signOut: vi.fn(), uid: { value: 'u1' }, user: { value: null } },
  deleteRow: vi.fn(),
  deleteRows: vi.fn(),
  demo: { value: false },
  today: Date.UTC(2026, 8, 23),
  upsertRow: vi.fn(),
  upsertRows: vi.fn(),
  watchTable: vi.fn(() => ({ abort: vi.fn() })),
}))

vi.mock('~~/services/powersync/db', () => ({ watchTable: h.watchTable }))
vi.mock('~~/services/powersync/mutations', () => ({ deleteRow: h.deleteRow, deleteRows: h.deleteRows, upsertRow: h.upsertRow, upsertRows: h.upsertRows }))
vi.mock('~/components/demo/useDemo', () => ({ useDemo: () => ({ isDemo: h.demo }) }))
vi.mock('~/composables/useSupabase', () => ({ useSupabase: () => ({}), useSupabaseAuth: () => h.auth }))

const TODAY = h.today
const MONTH_START = Date.UTC(2026, 8, 1)

vi.mock('~~/utils/date/civil', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~~/utils/date/civil')>()
  return { ...actual, todayCivilDayEpoch: () => h.today }
})

function wallet(over: Partial<WalletItem> = {}): WalletItem {
  return { color: '#fff', createdAt: 1, currencyCode: 'USD', description: '', isArchived: false, isExcludedFromTotal: false, isWithdrawable: false, name: 'w', sortOrder: 0, type: 'cash', updatedAt: 1, ...over } as WalletItem
}

function loan(over: Partial<LoanItem> = {}): LoanItem {
  return {
    annualRatePercent: 12,
    contractNumber: '',
    createdAt: 1,
    description: '',
    firstPaymentDate: Date.UTC(2026, 8, 10),
    interestAccrual: 'monthly',
    lateAfterDays: 3,
    paymentDayOfMonth: 10,
    prepaymentMode: 'reduce_payment',
    prepaymentWindowDays: 15,
    principalAmount: 1_200_000,
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
    h.deleteRows.mockReset().mockResolvedValue(undefined)
  })

  describe('trnsByCreditWallet', () => {
    it('takes transfers INTO a credit wallet as payments and ignores transfers out', () => {
      const store = setup({
        out: { createdAt: 1, date: TODAY, fromAmount: 30_000, fromWalletId: 'credit1', toAmount: 30_000, toWalletId: 'cash1', type: 'transfer', updatedAt: 1 },
        repay: { createdAt: 1, date: TODAY, fromAmount: 100_000, fromWalletId: 'cash1', toAmount: 100_000, toWalletId: 'credit1', type: 'transfer', updatedAt: 1 },
      }, { cash1: wallet(), credit1: wallet({ creditLimit: 0, type: 'credit_card' }) })

      expect(store.trnsByCreditWallet.get('credit1')).toEqual([
        { amount: 100_000, date: TODAY, id: 'repay', kind: 'payment' },
      ])
      expect(store.trnsByCreditWallet.has('cash1')).toBe(false)
    })

    it('classifies expenses of a credit wallet by their reserved category and skips the rest', () => {
      const store = setup({
        fine: { categoryId: 'loan_fine', createdAt: 1, date: TODAY, fromAmount: 3000, fromWalletId: 'credit1', type: 'expense', updatedAt: 1 },
        food: { categoryId: 'food', createdAt: 1, date: TODAY, fromAmount: 1000, fromWalletId: 'credit1', type: 'expense', updatedAt: 1 },
        interest: { categoryId: 'loan_interest', createdAt: 1, date: TODAY, fromAmount: 20000, fromWalletId: 'credit1', type: 'expense', updatedAt: 1 },
        otherWallet: { categoryId: 'loan_interest', createdAt: 1, date: TODAY, fromAmount: 5000, fromWalletId: 'cash1', type: 'expense', updatedAt: 1 },
      }, { cash1: wallet(), credit1: wallet({ creditLimit: 0, type: 'credit_card' }) })

      expect(store.trnsByCreditWallet.get('credit1')?.map(t => [t.id, t.kind])).toEqual([
        ['fine', 'fine'],
        ['interest', 'interest'],
      ])
    })

    it('sums interest and fees per month for a credit wallet with no loan row', () => {
      const store = setup({
        a: { categoryId: 'loan_interest', createdAt: 1, date: Date.UTC(2026, 7, 5), fromAmount: 10000, fromWalletId: 'credit1', type: 'expense', updatedAt: 1 },
        b: { categoryId: 'loan_fine', createdAt: 1, date: Date.UTC(2026, 7, 9), fromAmount: 2000, fromWalletId: 'credit1', type: 'expense', updatedAt: 1 },
        c: { categoryId: 'loan_interest', createdAt: 1, date: Date.UTC(2026, 8, 2), fromAmount: 4000, fromWalletId: 'credit1', type: 'expense', updatedAt: 1 },
      }, { cash1: wallet(), credit1: wallet({ creditLimit: 0, type: 'credit_card' }) })

      expect(store.costByWalletId.get('credit1')).toEqual({
        byMonth: [
          { fine: 2000, interest: 10_000, month: Date.UTC(2026, 7, 1) },
          { fine: 0, interest: 4000, month: MONTH_START },
        ],
        fine: 2000,
        interest: 14_000,
      })
    })
  })

  describe('byWalletId', () => {
    it('keeps the entry object of a loan across an unrelated trn edit', () => {
      const store = setup({}, { cash1: wallet(), credit1: wallet({ creditLimit: 0, type: 'credit_card' }) })
      store.setLoans({ l1: loan() })
      const before = store.byWalletId.get('credit1')

      useTrnsStore().setTrns({ coffee: { categoryId: 'food', createdAt: 1, date: TODAY, fromAmount: 500, fromWalletId: 'cash1', type: 'expense', updatedAt: 1 } })
      expect(store.byWalletId.get('credit1')).toBe(before)
    })
  })

  describe('dueThisMonth', () => {
    it('is null without anything due', () => {
      const store = setup({}, { credit1: wallet({ creditLimit: 0, type: 'credit_card' }) })
      expect(store.dueThisMonth).toBeNull()
    })

    it('adds the next scheduled payment of a loan', () => {
      const store = setup({}, { credit1: wallet({ creditLimit: 0, type: 'credit_card' }) })
      store.setLoans({ l1: loan() })

      const due = store.dueThisMonth!
      expect(due.nearestDate).toBe(Date.UTC(2026, 8, 10))
      expect(due.amount).toBeGreaterThan(0)
    })

    it('adds the minimum payment of a credit wallet without a loan, only within the next 31 days', () => {
      const store = setup({}, {
        card: wallet({ creditLimit: 0, type: 'credit_card' }),
        later: wallet({ creditLimit: 0, type: 'credit_card' }),
      })
      useBankReportsStore().setBankReports({
        card: { createdAt: 1, minPaymentAmount: 320_000, minPaymentDueDate: Date.UTC(2026, 8, 25), minPaymentPeriodStartDate: TODAY, updatedAt: 1 },
        later: { createdAt: 1, minPaymentAmount: 50_000, minPaymentDueDate: Date.UTC(2026, 10, 5), minPaymentPeriodStartDate: TODAY, updatedAt: 1 },
      })

      expect(store.dueThisMonth).toEqual({ amount: 320_000, nearestDate: Date.UTC(2026, 8, 25) })
    })

    it('ignores the minimum payment of a wallet that has a loan row and adds the overdue row with the next one', () => {
      const store = setup({}, {
        credit1: wallet({ creditLimit: 0, type: 'credit_card' }),
      })
      useBankReportsStore().setBankReports({ credit1: { createdAt: 1, minPaymentAmount: 99_900, minPaymentDueDate: Date.UTC(2026, 8, 25), minPaymentPeriodStartDate: TODAY, updatedAt: 1 } })
      store.setLoans({ l1: loan() })

      expect(store.dueThisMonth).toEqual({ amount: 213_238, nearestDate: Date.UTC(2026, 8, 10) })
    })
  })

  describe('writes', () => {
    it('upserts a loan and rolls back when the local write fails', async () => {
      const store = setup({}, { credit1: wallet({ creditLimit: 0, type: 'credit_card' }) })
      store.saveLoan('l1', loan())
      expect(h.upsertRow).toHaveBeenCalledWith('loans', 'l1', expect.objectContaining({ user_id: 'u1' }))

      h.upsertRow.mockRejectedValueOnce(new Error('nope'))
      store.saveLoan('l2', loan({ walletId: 'credit2' }))
      await new Promise<void>(resolve => setTimeout(resolve, 0))
      expect(store.items.l2).toBeUndefined()
    })

    it('skips a loan that fails the schema instead of writing it', () => {
      const store = setup({}, { credit1: wallet({ creditLimit: 0, type: 'credit_card' }) })
      h.upsertRow.mockClear()
      store.saveLoan('l1', loan({ termMonths: 12.5 }))
      expect(h.upsertRow).not.toHaveBeenCalled()
      expect(store.items.l1).toBeUndefined()
    })

    it('deletes a loan with its own schedule overrides', () => {
      const store = setup({}, { credit1: wallet({ creditLimit: 0, type: 'credit_card' }) })
      store.setLoans({ l1: loan() })
      store.setScheduleOverrides({
        other: { createdAt: 1, dueDate: TODAY, interestAmount: 1, loanId: 'l2', paymentNumber: 1, principalAmount: 1, source: 'manual', totalAmount: 2, updatedAt: 1 },
        r1: { createdAt: 1, dueDate: TODAY, interestAmount: 1, loanId: 'l1', paymentNumber: 1, principalAmount: 1, source: 'manual', totalAmount: 2, updatedAt: 1 },
      })

      store.deleteLoan('l1')
      expect(Object.keys(store.scheduleOverrides)).toEqual(['other'])
      expect(h.deleteRow).toHaveBeenCalledWith('loans', 'l1')
      expect(h.deleteRows).toHaveBeenCalledWith('loan_schedule_overrides', ['r1'])
    })
  })
})
