import type { LoanItem } from '~/components/loans/types'

export type ScheduleType = 'annuity' | 'differentiated'
export type PrepaymentMode = LoanItem['prepaymentMode']
type RowSource = 'generated' | 'bank' | 'manual'
/**
 * `payment` is the whole payment that reached the credit wallet; `interest` and `fine` are what the
 * bank took out of it on the credit wallet, so the principal repaid is payment - interest - fine.
 */
export type LoanTrnKind = 'payment' | 'interest' | 'fine'
type PaymentStatus = 'scheduled' | 'paid' | 'partial' | 'overdue' | 'late'

/** Contract parameters. Every date is a civil day (UTC-midnight ms-epoch). */
export type LoanParams = Pick<LoanItem, 'firstPaymentDate' | 'interestAccrual' | 'lateAfterDays' | 'paymentDayOfMonth' | 'prepaymentMode' | 'prepaymentWindowDays' | 'principalAmount' | 'scheduleType' | 'startDate' | 'termMonths'> & {
  /** Yearly rate in percent the schedule runs at. */
  annualRate: number
}

/** A stored row that replaces what the generator would produce for that number. */
export type ScheduleOverride = Pick<ScheduleRow, 'date' | 'interestPart' | 'paymentNumber' | 'principalPart' | 'totalAmount'> & { source: 'bank' | 'manual' }

export type ScheduleRow = {
  date: number
  interestPart: number
  paymentNumber: number
  principalPart: number
  /** Debt left after this payment. */
  remainingBalance: number
  source: RowSource
  totalAmount: number
}

export type LoanTrn = {
  amount: number
  date: number
  id: string
  kind: LoanTrnKind
}

export type PaymentRow = {
  /** Day of the last payment on the row, prepayments included (they leave `paidAt` alone). */
  lastPaymentAt: number | null
  paidAt: number | null
  paidFine: number
  paidInterest: number
  paidPrincipal: number
  status: PaymentStatus
  trnIds: string[]
} & ScheduleRow

export type LoanSummary = {
  /** Civil day of the last payment of a closed loan; null while it is open. */
  closedDate: number | null
  /** Paid interest annualized over the average outstanding balance of the settled rows. */
  effectiveRate: number
  /** Index in `rows` of the first row not yet paid; -1 when every row is. */
  firstUnpaidIndex: number
  /** Settled rows whose interest was never recorded, so their whole payment counts as principal. */
  interestMissing: number
  interestShare: number
  isClosed: boolean
  /** Rows not yet paid. */
  monthsLeft: number
  nextPayment: { amount: number, date: number } | null
  overdueCount: number
  paidFine: number
  paidInterest: number
  paidPrincipal: number
  paidTotal: number
  plannedEndDate: number | null
  plannedInterest: number
  plannedTotal: number
  /**
   * Rate the unpaid rows and what-if are projected at: the contract rate, or for a loan without
   * one the rate its paid interest or bank schedule implies. null: nothing to project from.
   */
  projectionRate: number | null
  /** Debt left, taken from the credit wallet balance (which is negative). */
  remaining: number
  rows: PaymentRow[]
  /**
   * Gap between the wallet balance and the reconciled principal. 0 when everything matches. A
   * wallet with a `loans` row carries only the loan, so any other movement on it (spending,
   * cashback, adjustment) shows up here on purpose: the schedule no longer explains the balance.
   */
  unrecognized: number
}

export type WhatIfResult = {
  interestSaved: number
  newEndDate: number | null
}

/** Interest and fees paid on a credit product, totalled and bucketed by civil month. */
export type LoanCost = {
  byMonth: { fine: number, interest: number, month: number }[]
  fine: number
  interest: number
}
