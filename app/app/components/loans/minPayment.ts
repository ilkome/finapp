import type { LoanTrn } from '~/components/loans/engine/types'
import type { WalletItem } from '~/components/wallets/types'

export type MinPaymentStatus = 'due' | 'overdue' | 'paid' | 'stale'

export type MinPaymentInput = {
  amount: number
  /** Civil day the minimum is due. */
  date: number
  /** Sum of the payments into the credit wallet since `updatedAt`. */
  paidSince: number
  today: number
  /** Civil day the bank sync last refreshed the summary. */
  updatedAt: number
}

/** A summary nobody refreshed for this long is reported as stale instead of due or overdue. */
export const MIN_PAYMENT_STALE_DAYS = 40
const DAY_MS = 86_400_000

export function minPaymentStatus({ amount, date, paidSince, today, updatedAt }: MinPaymentInput): MinPaymentStatus {
  if (paidSince >= amount)
    return 'paid'
  // Staleness is checked after "paid": a payment we can see beats a summary we cannot refresh.
  if (today - updatedAt > MIN_PAYMENT_STALE_DAYS * DAY_MS)
    return 'stale'
  return today > date ? 'overdue' : 'due'
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
  const paidSince = trns
    .filter(trn => trn.kind === 'payment' && trn.date >= updatedAt)
    .reduce((total, trn) => total + trn.amount, 0)

  return {
    amount: wallet.minPaymentAmount,
    date: wallet.minPaymentDate,
    status: minPaymentStatus({ amount: wallet.minPaymentAmount, date: wallet.minPaymentDate, paidSince, today, updatedAt }),
  }
}
