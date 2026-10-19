import { describe, expect, it, vi } from 'vitest'

import type { BankReport } from '~/components/bankReports/types'
import type { LoanItem, LoanScheduleOverrideItem } from '~/components/loans/types'
import type { TrnItem } from '~/components/trns/types'
import type { WalletItem } from '~/components/wallets/types'

import { AppSchema } from './AppSchema'
import { itemToRow, JSON_COLUMNS, rowToItem, TABLE_COLUMNS } from './columns'
import {
  bankReportToRow,
  categoryToRow,
  loanScheduleOverrideToRow,
  loanToRow,
  rowToBankReport,
  rowToCategory,
  rowToLoan,
  rowToLoanScheduleOverride,
  rowToTrn,
  rowToWallet,
  trnToRow,
  walletToRow,
} from './transforms'

vi.mock('~/utils/logger', () => ({ createLogger: () => ({ error: () => {}, log: () => {}, warn: () => {} }) }))

const DAY = 86400000
const row = <T extends Record<string, unknown>>(id: string, value: T) => ({ id, ...value })

describe('column map', () => {
  it('builds the SQLite schema and the JSON upload columns from the same map', () => {
    expect(AppSchema.tables.map(t => t.name).sort()).toEqual(Object.keys(TABLE_COLUMNS).sort())
    expect(JSON_COLUMNS).toEqual({ exchange_rates: ['rates'], stat_views: ['auto_rule', 'config'] })
  })

  it('maps snake_case to camelCase, 0/1 to boolean, JSON text to objects, and drops nulls', () => {
    expect(rowToItem('stat_views', { auto_rule: null, config: '{"a":1}', is_active: 1, sort_order: '2', user_id: 'u' }))
      .toEqual({ config: { a: 1 }, isActive: true, sortOrder: 2, userId: 'u' })
  })

  it('writes every mapped column, absent and empty text as null', () => {
    const written = itemToRow('categories', { color: '#fff', description: 'ignored', isInRecent: false, name: '' })
    expect(Object.keys(written).sort()).toEqual(Object.keys(TABLE_COLUMNS.categories).sort())
    expect(written).toMatchObject({ color: '#fff', is_in_recent: 0, name: null, parent_id: null })
  })
})

describe('transactions', () => {
  const expense: TrnItem = { categoryId: 'c1', createdAt: 5, date: 3 * DAY, description: 'Coffee', fromAmount: 35050, fromWalletId: 'w1', type: 'expense', updatedAt: 7 }
  const transfer: TrnItem = { createdAt: 5, date: 3 * DAY, fromAmount: 1000, fromWalletId: 'w1', toAmount: 70000, toWalletId: 'w2', type: 'transfer', updatedAt: 7 }
  const outside: TrnItem = { createdAt: 5, date: 3 * DAY, toAmount: 1000, toWalletId: 'w2', type: 'transfer', updatedAt: 7 }

  it('round-trips every flow shape with integer minor units', () => {
    for (const trn of [expense, transfer, outside])
      expect(rowToTrn(row('t1', trnToRow(trn, 'u1')))).toEqual(trn)
    expect(trnToRow(expense, 'u1')).toMatchObject({ from_amount: 35050, from_wallet_id: 'w1', to_amount: null, type: 'expense', user_id: 'u1' })
  })

  it('rejects a row the server constraint would reject', () => {
    expect(rowToTrn(row('t1', { ...trnToRow(expense, 'u1'), category_id: null }))).toBeNull()
    expect(rowToTrn(row('t1', { ...trnToRow(transfer, 'u1'), to_wallet_id: 'w1' }))).toBeNull()
    expect(rowToTrn(row('t1', { ...trnToRow(expense, 'u1'), date: 3 * DAY + 1 }))).toBeNull()
    expect(rowToTrn(row('t1', { ...trnToRow(outside, 'u1'), to_amount: null }))).toBeNull()
  })
})

describe('wallets and categories', () => {
  const wallet: WalletItem = { color: 'red', createdAt: 1, creditLimit: 5000000, currencyCode: 'RUB', description: '', isArchived: false, isExcludedFromTotal: true, isWithdrawable: false, name: 'Card', sortOrder: 3, type: 'credit_card', updatedAt: 2 }

  it('round-trips a wallet; the forecast switch stays absent until set', () => {
    expect(rowToWallet(row('w1', walletToRow(wallet, 'u1')))).toEqual(wallet)
    expect(rowToWallet(row('w1', walletToRow({ ...wallet, isInForecast: false }, 'u1')))!.isInForecast).toBe(false)
  })

  it('refuses a credit limit on a wallet that is not a credit card', () => {
    expect(rowToWallet(row('w1', { ...walletToRow(wallet, 'u1'), type: 'cash' }))).toBeNull()
  })

  it('keeps 0 as the client root of a category and null in the row', () => {
    const written = categoryToRow({ color: '#000', icon: 'mdi:a', isInQuickSelector: false, isInRecent: true, name: 'Food', parentId: 0 }, 'u1')
    expect(written.parent_id).toBeNull()
    expect(rowToCategory(row('c1', written))).toMatchObject({ name: 'Food', parentId: 0 })
    expect(rowToCategory(row('c2', { ...written, parent_id: 'c1' }))!.parentId).toBe('c1')
  })
})

describe('loans and bank reports', () => {
  const loan: LoanItem = {
    annualRatePercent: 24.5,
    contractNumber: '1234-5678',
    createdAt: 1,
    description: 'Loan A',
    firstPaymentDate: 20 * DAY,
    interestAccrual: 'daily',
    lateAfterDays: 5,
    paymentDayOfMonth: 20,
    paymentWalletId: 'w-debit',
    prepaymentMode: 'reduce_term',
    prepaymentWindowDays: 10,
    principalAmount: 24000000,
    scheduleType: 'differentiated',
    startDate: 10 * DAY,
    termMonths: 42,
    updatedAt: 42,
    walletId: 'w-credit',
  }

  it('round-trips a loan; its id is the wallet id', () => {
    expect(rowToLoan(row('w-credit', loanToRow(loan, 'u1')))).toEqual(loan)
    expect(rowToLoan(row('w-credit', loanToRow({ ...loan, annualRatePercent: null }, 'u1')))!.annualRatePercent).toBeNull()
  })

  it('reads a loan without its settings with the defaults', () => {
    const settingless = { ...loanToRow(loan, 'u1'), interest_accrual: null, late_after_days: null, prepayment_window_days: null }
    expect(rowToLoan(row('w-credit', settingless))).toMatchObject({ interestAccrual: 'monthly', lateAfterDays: 3, prepaymentWindowDays: 15 })
  })

  it('round-trips a schedule override and a bank report', () => {
    const override: LoanScheduleOverrideItem = { createdAt: 1, dueDate: 30 * DAY, interestAmount: 120050, loanId: 'w-credit', paymentNumber: 2, principalAmount: 500000, source: 'bank', totalAmount: 620050, updatedAt: 2 }
    expect(rowToLoanScheduleOverride(row('w-credit:2', loanScheduleOverrideToRow(override, 'u1')))).toEqual(override)
    const report: BankReport = { createdAt: 1, debtAmount: 18732040, debtReportDate: 40 * DAY, minPaymentAmount: 300000, updatedAt: 2 }
    expect(rowToBankReport(row('w-credit', bankReportToRow(report, 'u1')))).toEqual(report)
  })
})
