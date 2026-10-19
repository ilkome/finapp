import type { BankReport } from '~/components/bankReports/types'
import type { PaymentRow } from '~/components/loans/engine/types'

/**
 * The wallet checked against the debt the bank itself reports. `diff` is our debt minus the
 * bank's in minor units; one unit either way is rounding. Stale when a scheduled payment fell due after the bank
 * figure was read: the bank number no longer covers that payment.
 */
export function bankDebtCheck(params: {
  report: Pick<BankReport, 'debtAmount' | 'debtReportDate'> | undefined
  rows: PaymentRow[]
  today: number
  walletBalance: number
}) {
  const { report, rows, today, walletBalance } = params
  const { debtAmount, debtReportDate } = report ?? {}
  if (debtAmount === undefined || debtReportDate === undefined)
    return null

  const diff = -walletBalance - debtAmount
  const lastDue = rows.findLast(row => row.date <= today)?.date

  return {
    diff: Math.abs(diff) <= 1 ? 0 : diff,
    isStale: lastDue !== undefined && debtReportDate < lastDue,
    updatedAt: debtReportDate,
  }
}
