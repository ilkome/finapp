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
  bankDebtAmount: 251400.5,
  bankDebtUpdatedAt: 1790000000000,
  contractNumber: '1234-5678',
  debitWalletId: 'w-debit',
  desc: 'Loan A',
  firstPaymentDate: 1772323200000,
  interestMethod: 'daily',
  lateAfterDays: 5,
  nextPaymentDate: 1791072000000,
  nextPaymentInterest: 5000,
  nextPaymentPrincipal: 0,
  overpaymentMode: 'reduceTerm',
  paymentDay: 1,
  prepayWindowDays: 10,
  principalAmount: 300000,
  scheduleType: 'differentiated',
  startDate: 1769904000000,
  termMonths: 65,
  updatedAt: 42,
  walletId: 'w-credit',
}

describe('loan transforms', () => {
  it('round-trips a loan through the row shape', () => {
    expect(rowToLoan({ id: 'l1', ...loanToRow(loan, 'u1') } as never)).toEqual(loan)
    expect(rowToLoan({ id: 'l1', ...loanToRow({ ...loan, annualRate: null }, 'u1') } as never).annualRate).toBeNull()
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
      date: 1772323200000,
      interestPart: 8224.98,
      loanId: 'l1',
      paymentNumber: 1,
      principalPart: 2211.76,
      source: 'bank',
      totalAmount: 12500,
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
      minPaymentAmount: 30828.7,
      minPaymentDate: 1759708800000,
      minPaymentUpdatedAt: 1758499200000,
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
})
