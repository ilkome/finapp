import { describe, expect, it } from 'vitest'

import type { LoanItem, LoanScheduleRowItem } from '~/components/loans/types'
import type { WalletItem } from '~/components/wallets/types'

import {
  loanScheduleRowToRow,
  loanToRow,
  rowToLoan,
  rowToLoanScheduleRow,
  rowToWallet,
  walletToRow,
} from './transforms'

const loan: LoanItem = {
  annualRate: 24.5,
  bankDebtAmount: 187320.4,
  bankDebtUpdatedAt: 1700000000000,
  contractNumber: '1234-5678',
  debitWalletId: 'w-debit',
  desc: 'Loan A',
  firstPaymentDate: 1689811200000,
  interestMethod: 'daily',
  lateAfterDays: 5,
  nextPaymentDate: 1700438400000,
  nextPaymentInterest: 5000,
  nextPaymentPrincipal: 0,
  overpaymentMode: 'reduceTerm',
  paymentDay: 20,
  prepayWindowDays: 10,
  principalAmount: 240000,
  scheduleType: 'differentiated',
  startDate: 1687219200000,
  termMonths: 42,
  updatedAt: 42,
  walletId: 'w-credit',
}

describe('loan transforms', () => {
  it('round-trips a loan through the row shape', () => {
    expect(rowToLoan({ id: 'l1', ...loanToRow(loan, 'u1') } as never)).toEqual(loan)
    expect(rowToLoan({ id: 'l1', ...loanToRow({ ...loan, annualRate: null }, 'u1') } as never).annualRate).toBeNull()
  })

  it('round-trips the closed date and reads a row from before the column as open', () => {
    expect(rowToLoan({ id: 'l1', ...loanToRow({ ...loan, closedDate: 1_700_000_000_000 }, 'u1') } as never).closedDate).toBe(1_700_000_000_000)
    const { closedDate: _drop, ...row } = loanToRow(loan, 'u1')
    expect(rowToLoan({ id: 'l1', ...row } as never)).not.toHaveProperty('closedDate')
  })

  it('reads a row from before the settings columns with the default settings', () => {
    const row = { id: 'l1', ...loanToRow(loan, 'u1'), interestMethod: null, lateAfterDays: null, prepayWindowDays: null }
    expect(rowToLoan(row as never)).toMatchObject({ interestMethod: 'monthly', lateAfterDays: 3, prepayWindowDays: 15 })
  })

  it('drops the optional debit wallet and empty text to null', () => {
    const { debitWalletId: _drop, ...bare } = { ...loan, contractNumber: '', desc: '' }
    const row = loanToRow(bare as LoanItem, 'u1')
    expect(row).toMatchObject({ contractNumber: null, debitWalletId: null, desc: null, userId: 'u1' })
    expect(rowToLoan({ id: 'l1', ...row } as never)).toEqual(bare)
  })

  it('round-trips a schedule row', () => {
    const item: LoanScheduleRowItem = {
      date: 1689811200000,
      interestPart: 4931.51,
      loanId: 'l1',
      paymentNumber: 1,
      principalPart: 3568.49,
      source: 'bank',
      totalAmount: 8500,
      updatedAt: 7,
    }
    expect(rowToLoanScheduleRow({ id: 's1', ...loanScheduleRowToRow(item, 'u1') } as never)).toEqual(item)
  })
})

describe('wallet minimum payment fields', () => {
  it('round-trips them on a credit wallet', () => {
    const wallet: WalletItem = {
      color: '#111',
      creditLimit: 100000,
      currency: 'RUB',
      desc: '',
      isArchived: false,
      isExcludeInTotal: false,
      isWithdrawal: false,
      minPaymentAmount: 4270.15,
      minPaymentDate: 1696291200000,
      minPaymentUpdatedAt: 1693526400000,
      name: 'Installments',
      order: 0,
      type: 'credit',
      updatedAt: 5,
    }
    expect(rowToWallet({ id: 'w1', ...walletToRow(wallet, 'u1') } as never)).toEqual(wallet)
  })

  it('writes null for non-credit wallets and omits them when unset', () => {
    const cash: WalletItem = {
      color: '#111',
      currency: 'RUB',
      desc: '',
      isArchived: false,
      isExcludeInTotal: false,
      isWithdrawal: false,
      name: 'Cash',
      order: 0,
      type: 'cash',
      updatedAt: 5,
    }
    expect(walletToRow(cash, 'u1')).toMatchObject({ minPaymentAmount: null, minPaymentDate: null, minPaymentUpdatedAt: null })
    expect(rowToWallet({ id: 'w1', ...walletToRow(cash, 'u1') } as never)).toEqual(cash)
  })

  it('round-trips a loan wallet without the credit card fields', () => {
    const loan: WalletItem = { color: '#111', currency: 'RUB', desc: '', isArchived: false, isExcludeInTotal: false, isWithdrawal: false, name: 'Loan', order: 0, type: 'loan', updatedAt: 5 }
    expect(walletToRow(loan, 'u1')).toMatchObject({ creditLimit: null, minPaymentAmount: null, type: 'loan' })
    expect(rowToWallet({ id: 'w1', ...walletToRow(loan, 'u1') } as never)).toEqual(loan)
  })
})
