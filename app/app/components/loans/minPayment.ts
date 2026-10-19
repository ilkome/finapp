import { roundTo } from '~~/utils/amount/round'
import { addCivilDays, addCivilMonths } from '~~/utils/date/civil'

import type { LoanTrn } from '~/components/loans/engine/types'
import type { WalletItem } from '~/components/wallets/types'

import { currencyMinorUnit } from '~/components/currencies/currencies'

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

/**
 * Payments into the wallet from `since` on, rounded to its currency: a raw float sum can land just
 * below the minimum it exactly covers (100.10 + 200.70 = 300.79999999999995).
 */
function paidSinceOf(wallet: WalletItem, trns: LoanTrn[], since: number): number {
  const total = trns
    .filter(trn => trn.kind === 'payment' && trn.date >= since)
    .reduce((sum, trn) => sum + trn.amount, 0)
  return roundTo(total, currencyMinorUnit(wallet.currency))
}

/**
 * The minimum payment line of a revolving credit wallet, or null when no sync reported one.
 * "Paid" is decided by what reached the wallet since the billing period started, per the field
 * contract on `WalletItem.minPaymentUpdatedAt`: the bank reports the minimum for the period, not
 * whether it was met.
 */
export function minPaymentOf(
  wallet: WalletItem,
  trns: LoanTrn[],
  today: number,
): { amount: number, date: number, status: MinPaymentStatus } | null {
  if (wallet.type !== 'credit' || !wallet.minPaymentAmount || wallet.minPaymentDate == null)
    return null

  const updatedAt = wallet.minPaymentUpdatedAt ?? wallet.minPaymentDate
  const paidSince = paidSinceOf(wallet, trns, updatedAt)

  return {
    amount: wallet.minPaymentAmount,
    date: wallet.minPaymentDate,
    status: minPaymentStatus({ amount: wallet.minPaymentAmount, date: wallet.minPaymentDate, paidSince, today, updatedAt }),
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
 * The interest-free (grace) line of a revolving credit wallet, or null when no sync reported one.
 * Paid is what reached the wallet since the last statement, falling back to the minimum's period
 * start when the statement day is unknown; a zero statement debt is always paid.
 */
export function graceOf(wallet: WalletItem, trns: LoanTrn[], today: number): GraceLine | null {
  if (wallet.type !== 'credit' || wallet.graceAmount == null)
    return null

  const statementDate = wallet.statementDate ?? null
  if (wallet.graceAmount === 0)
    return { amount: 0, date: wallet.graceEndDate ?? null, statementDate, status: 'paid' }
  if (wallet.graceEndDate == null)
    return null

  const updatedAt = wallet.minPaymentUpdatedAt ?? statementDate ?? wallet.graceEndDate
  const since = statementDate ?? updatedAt
  const paidSince = paidSinceOf(wallet, trns, since)

  return {
    amount: wallet.graceAmount,
    date: wallet.graceEndDate,
    statementDate,
    status: minPaymentStatus({ amount: wallet.graceAmount, date: wallet.graceEndDate, paidSince, today, updatedAt }),
  }
}

/**
 * Fields of a minimum entered by hand: the billing period is taken as the month before the due day,
 * so payments made since then count towards it. null clears both.
 */
export function manualMinPaymentDates(dueDate: number | null): { minPaymentDate?: number, minPaymentUpdatedAt?: number } {
  return dueDate == null
    ? { minPaymentDate: undefined, minPaymentUpdatedAt: undefined }
    : { minPaymentDate: dueDate, minPaymentUpdatedAt: addCivilMonths(dueDate, -1) }
}
