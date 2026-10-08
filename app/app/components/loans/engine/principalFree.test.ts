import { describe, expect, it } from 'vitest'

import type { LoanParams, LoanTrn, LoanTrnKind, OverpaymentMode, ScheduleType } from '~/components/loans/engine/types'

import loanB from '~/components/demo/loans/loan-b.json'
import { principalFreeRows } from '~/components/loans/engine/principalFree'
import { reconcileSchedule } from '~/components/loans/engine/reconcile'
import { generateSchedule } from '~/components/loans/engine/schedule'

const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)

describe('principalFreeRows on loan B', () => {
  const params: LoanParams = {
    ...loanB.params,
    firstPaymentDate: day(loanB.params.firstPaymentDate),
    overpaymentMode: loanB.params.overpaymentMode as OverpaymentMode,
    scheduleType: loanB.params.scheduleType as ScheduleType,
    startDate: day(loanB.params.startDate),
  }
  const overrides = loanB.bankSchedule.map(row => ({ ...row, date: day(row.date), source: 'bank' as const }))
  const trns: LoanTrn[] = loanB.trns.map(trn => ({ ...trn, date: day(trn.date), kind: trn.kind as LoanTrnKind }))
  const rows = reconcileSchedule(params, generateSchedule(params, overrides), trns, day('2024-04-20'))
  const result = principalFreeRows(rows)

  it('flags the January holiday and the interest-only spring, not the small top-ups of paying months', () => {
    expect(result.byRow.get(10)).toBe('holiday')
    expect(result.byRow.get(11)).toBe('interestOnly')
    expect(result.byRow.get(12)).toBe('interestOnly')
    expect(result.byRow.get(13)).toBe('interestOnly')
    // 2023-08-05 interest top-up sits in a month that repaid principal.
    expect(result.byRow.has(5)).toBe(false)
    expect(result.byRow.has(9)).toBe(false)
  })

  it('sums the interest of the settled principal-free months', () => {
    // June 2023 (first, interest-only period), January holiday, February-April.
    expect(result.settledMonths).toBe(5)
    const expected = rows
      .filter(row => result.byRow.has(row.paymentNumber) && (row.status === 'paid' || row.status === 'late'))
      .reduce((total, row) => total + row.paidInterest, 0)
    expect(result.settledInterest).toBeCloseTo(expected, 2)
    expect(result.settledInterest).toBeGreaterThan(3 * 6346.32)
  })
})
