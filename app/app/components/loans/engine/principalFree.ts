import { startOfMonthCivil } from '~~/utils/date/civil'

import type { PaymentRow } from '~/components/loans/engine/types'

import { isSettled } from '~/components/loans/engine/summary'

type PrincipalFreeKind = 'holiday' | 'interestOnly'

const cache = new WeakMap<PaymentRow[], ReturnType<typeof computePrincipalFree>>()

/**
 * Rows of the calendar months in which the debt does not move: no row of the month carries
 * principal. Grouped by month because a bank may add small interest-only rows next to a regular
 * payment, and those must not flag a month that did repay principal. A missing payment has no
 * row and is already counted as overdue.
 */
export function principalFreeRows(rows: PaymentRow[]) {
  // The summary and the schedule of one wallet section both ask for the same rows.
  const hit = cache.get(rows)
  if (hit)
    return hit
  const result = computePrincipalFree(rows)
  cache.set(rows, result)
  return result
}

function computePrincipalFree(rows: PaymentRow[]) {
  const byMonth = Map.groupBy(rows, row => startOfMonthCivil(row.date))

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

  return { byRow, settledInterest, settledMonths }
}
