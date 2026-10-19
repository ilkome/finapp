import { addCivilDays } from '~~/utils/date/civil'

import type { BankReport } from '~/components/bankReports/types'
import type { LoanTrn } from '~/components/loans/engine/types'
import type { WalletItem } from '~/components/wallets/types'

export type MinPaymentStatus = 'due' | 'overdue' | 'paid' | 'stale'

type MinPaymentInput = {
  amount: number
  /** Civil day the minimum is due. */
  date: number
  /** Sum of the payments into the credit wallet since `updatedAt`. */
  paidSince: number
  today: number
  /** Civil day the summary was last refreshed. */
  updatedAt: number
}

/** A summary nobody refreshed for this long is reported as stale instead of due or overdue. */
const MIN_PAYMENT_STALE_DAYS = 40

export function minPaymentStatus({ amount, date, paidSince, today, updatedAt }: MinPaymentInput): MinPaymentStatus {
  if (paidSince >= amount)
    return 'paid'
  // Staleness is checked after "paid": a payment we can see beats a summary we cannot refresh.
  if (today > addCivilDays(updatedAt, MIN_PAYMENT_STALE_DAYS))
    return 'stale'
  return today > date ? 'overdue' : 'due'
}

/** Payments into the wallet from `since` on. */
function paidSinceOf(trns: LoanTrn[], since: number): number {
  return trns
    .filter(trn => trn.kind === 'payment' && trn.date >= since)
    .reduce((sum, trn) => sum + trn.amount, 0)
}

/**
 * The minimum payment line of a credit card, or null when its bank report has none.
 * "Paid" is decided by what reached the wallet since the billing period started
 * (`minPaymentPeriodStartDate`): the bank reports the minimum for the period, not whether it was met.
 */
export function minPaymentOf(
  wallet: Pick<WalletItem, 'type'>,
  report: BankReport | undefined,
  trns: LoanTrn[],
  today: number,
): { amount: number, date: number, status: MinPaymentStatus } | null {
  if (wallet.type !== 'credit_card' || !report?.minPaymentAmount || report.minPaymentDueDate === undefined)
    return null

  const updatedAt = report.minPaymentPeriodStartDate ?? report.minPaymentDueDate
  const paidSince = paidSinceOf(trns, updatedAt)

  return {
    amount: report.minPaymentAmount,
    date: report.minPaymentDueDate,
    status: minPaymentStatus({ amount: report.minPaymentAmount, date: report.minPaymentDueDate, paidSince, today, updatedAt }),
  }
}

export type GraceLine = {
  amount: number
  /** Civil day the interest-free period ends; null when nothing is left to repay. */
  date: number | null
  /** Civil day of the last statement. */
  statementDate: number | null
  status: MinPaymentStatus
}

/**
 * The interest-free (grace) line of a credit card, or null when its bank report has none.
 * Paid is what reached the wallet since the last statement, falling back to the minimum's period
 * start when the statement day is unknown; a zero statement debt is always paid.
 */
export function graceOf(wallet: Pick<WalletItem, 'type'>, report: BankReport | undefined, trns: LoanTrn[], today: number): GraceLine | null {
  if (wallet.type !== 'credit_card' || report?.graceDebtAmount === undefined)
    return null

  const statementDate = report.statementDate ?? null
  if (report.graceDebtAmount === 0)
    return { amount: 0, date: report.graceEndDate ?? null, statementDate, status: 'paid' }
  if (report.graceEndDate === undefined)
    return null

  const updatedAt = report.minPaymentPeriodStartDate ?? statementDate ?? report.graceEndDate
  const since = statementDate ?? updatedAt
  const paidSince = paidSinceOf(trns, since)

  return {
    amount: report.graceDebtAmount,
    date: report.graceEndDate,
    statementDate,
    status: minPaymentStatus({ amount: report.graceDebtAmount, date: report.graceEndDate, paidSince, today, updatedAt }),
  }
}
