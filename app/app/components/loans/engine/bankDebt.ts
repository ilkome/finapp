import { roundTo } from '~~/utils/amount/round'

import type { PaymentRow } from '~/components/loans/engine/types'

/**
 * The wallet checked against the debt the bank itself reports. `diff` is our debt minus the
 * bank's; within one minor unit of the currency is rounding. Stale when a scheduled payment fell due after the bank
 * figure was read: the bank number no longer covers that payment.
 */
export function bankDebtCheck(params: {
  bankDebtAmount: number | undefined
  bankDebtUpdatedAt: number | undefined
  /** Decimal places of the loan currency; 2 when omitted. */
  precision?: number
  rows: PaymentRow[]
  today: number
  walletBalance: number
}) {
  const { bankDebtAmount, bankDebtUpdatedAt, rows, today, walletBalance } = params
  if (bankDebtAmount === undefined || bankDebtUpdatedAt === undefined)
    return null

  const precision = params.precision ?? 2
  const diff = roundTo(-walletBalance - bankDebtAmount, precision)
  const lastDue = rows.findLast(row => row.date <= today)?.date

  return {
    diff: Math.abs(diff) <= 10 ** -precision ? 0 : diff,
    isStale: lastDue !== undefined && bankDebtUpdatedAt < lastDue,
    updatedAt: bankDebtUpdatedAt,
  }
}
