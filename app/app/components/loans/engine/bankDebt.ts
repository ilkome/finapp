import type { PaymentRow } from '~/components/loans/engine/types'

/**
 * The wallet checked against the debt the bank itself reports. `diff` is our debt minus the
 * bank's; within 1 unit is rounding. Stale when a scheduled payment fell due after the bank
 * figure was read: the bank number no longer covers that payment.
 */
export function bankDebtCheck(params: {
  bankDebtAmount: number | undefined
  bankDebtUpdatedAt: number | undefined
  rows: PaymentRow[]
  today: number
  walletBalance: number
}) {
  const { bankDebtAmount, bankDebtUpdatedAt, rows, today, walletBalance } = params
  if (bankDebtAmount === undefined || bankDebtUpdatedAt === undefined)
    return null

  const diff = Math.round((-walletBalance - bankDebtAmount) * 100) / 100
  const lastDue = rows.findLast(row => row.date <= today)?.date

  return {
    diff: Math.abs(diff) <= 1 ? 0 : diff,
    isStale: lastDue !== undefined && bankDebtUpdatedAt < lastDue,
    updatedAt: bankDebtUpdatedAt,
  }
}
