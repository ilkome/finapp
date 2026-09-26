import type { PaymentRow } from '~/components/loans/engine/types'

export type PrincipalFreeKind = 'holiday' | 'interestOnly'

function isSettled(row: PaymentRow): boolean {
  return row.status === 'paid' || row.status === 'late'
}

/**
 * Rows of the calendar months in which the debt does not move: no row of the month carries
 * principal. Grouped by month because Sber adds small interest-only rows next to a regular
 * payment, and those must not flag a month that did repay principal. A missing payment has no
 * row and is already counted as overdue.
 */
export function principalFreeRows(rows: PaymentRow[]) {
  const byMonth = new Map<number, PaymentRow[]>()
  for (const row of rows) {
    const date = new Date(row.date)
    const key = date.getUTCFullYear() * 12 + date.getUTCMonth()
    const list = byMonth.get(key)
    if (list)
      list.push(row)
    else byMonth.set(key, [row])
  }

  const byRow = new Map<number, PrincipalFreeKind>()
  let settledMonths = 0
  let settledInterest = 0

  for (const monthRows of byMonth.values()) {
    if (monthRows.some(row => row.principalPart > 0))
      continue
    for (const row of monthRows)
      byRow.set(row.paymentNumber, row.totalAmount === 0 ? 'holiday' : 'interestOnly')
    const settled = monthRows.filter(isSettled)
    if (settled.length > 0) {
      settledMonths++
      settledInterest += settled.reduce((total, row) => total + row.paidInterest, 0)
    }
  }

  return { byRow, settledInterest: Math.round(settledInterest * 100) / 100, settledMonths }
}
