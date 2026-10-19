import { describe, expect, it } from 'vitest'

import type { LoanParams, LoanTrn, LoanTrnKind, PrepaymentMode, ScheduleOverride, ScheduleType } from '~/components/loans/engine/types'

import loanA from '~/components/demo/loans/loan-a.json'
import loanB from '~/components/demo/loans/loan-b.json'
import loanC from '~/components/demo/loans/loan-c.json'
import { reconcileSchedule } from '~/components/loans/engine/reconcile'
import { generateSchedule } from '~/components/loans/engine/schedule'
import { summarizeLoan, whatIf } from '~/components/loans/engine/summary'

const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)

type RawParams = typeof loanA['params']
type RawRow = typeof loanA['bankSchedule'][number]
type RawTrn = typeof loanB['trns'][number]

function toParams(raw: RawParams): LoanParams {
  return {
    interestAccrual: 'monthly',
    lateAfterDays: 3,
    prepaymentWindowDays: 15,
    ...raw,
    firstPaymentDate: day(raw.firstPaymentDate),
    prepaymentMode: raw.prepaymentMode as PrepaymentMode,
    scheduleType: raw.scheduleType as ScheduleType,
    startDate: day(raw.startDate),
  }
}

function toOverrides(raw: RawRow[]): ScheduleOverride[] {
  return raw.map(row => ({ ...row, date: day(row.date), source: 'bank' as const }))
}

function toTrns(raw: RawTrn[]): LoanTrn[] {
  return raw.map(trn => ({ ...trn, date: day(trn.date), kind: trn.kind as LoanTrnKind }))
}

describe('loan A (540 000 at 18.7%, daily interest)', () => {
  const params = toParams(loanA.params)
  const bank = toOverrides(loanA.bankSchedule)

  it('generates 60 payments from the first payment date to the contract end', () => {
    const rows = generateSchedule(params)

    expect(rows).toHaveLength(60)
    expect(rows[0]?.date).toBe(day('2022-12-17'))
    expect(rows.at(-1)?.date).toBe(day('2027-11-17'))
    // The bank charges interest daily on actual/365 (row 1 is 540 000 * 18.7% * 30/365 = 8 299.73), so
    // its interest/principal split moves month to month. The generator stays self-consistent instead:
    // one fixed payment that clears the debt exactly.
    expect(rows.slice(0, 59).every(row => row.totalAmount === rows[0]?.totalAmount)).toBe(true)
    expect(rows.at(-1)?.remainingBalance).toBe(0)
  })

  it('reproduces the bank schedule from overrides, holiday row included', () => {
    const rows = generateSchedule(params, bank)

    expect(rows).toHaveLength(60)
    expect(rows[1]).toMatchObject({ date: day('2023-01-17'), interestPart: 848_714, totalAmount: 1_391_891 })
    expect(rows[3]).toMatchObject({ date: day('2023-03-17'), principalPart: 0, totalAmount: 0 })
    expect(rows[3]?.remainingBalance).toBe(rows[2]?.remainingBalance)
    // Principal left after the interest-only months, the bank says 523 431.01.
    expect(rows[6]?.date).toBe(day('2023-06-17'))
    expect(rows[6]?.remainingBalance).toBe(52_343_101)
  })

  it('pushes the term one month out when only the holiday months come from the bank', () => {
    const rows = generateSchedule(params, bank.slice(0, 4))

    expect(rows).toHaveLength(61)
    expect(rows.at(-1)?.date).toBe(day('2027-12-17'))
    expect(rows.at(-1)?.remainingBalance).toBe(0)
  })
})

describe('loan B (385 000 at 20.9%, holiday and top-ups)', () => {
  const params = toParams(loanB.params)
  const rows = generateSchedule(params, toOverrides(loanB.bankSchedule))
  const paid = reconcileSchedule(params, rows, toTrns(loanB.trns), day('2024-04-20'))
  const summary = summarizeLoan(params, paid, loanB.walletBalance)

  it('splits the feed by the bank schedule rows', () => {
    expect(summary.paidTotal).toBeCloseTo(8_035_736, 0)
    expect(summary.paidPrincipal).toBeCloseTo(2_061_800, -2)
    expect(summary.paidInterest).toBeCloseTo(5_973_900, -2)
    expect(summary.unrecognized).toBe(0)
    expect(summary.isClosed).toBe(false)
  })

  it('lands the two early payments in their own rows', () => {
    expect(paid[1]?.trnIds).toContain('b2i')
    expect(paid[4]?.trnIds).toContain('b6i')
  })

  it('treats the January holiday row as settled and keeps the tail scheduled', () => {
    expect(paid[9]).toMatchObject({ date: day('2024-01-04'), status: 'paid', totalAmount: 0 })
    expect(paid[12]?.status).toBe('paid')
    expect(paid[13]?.status).toBe('scheduled')
    expect(summary.overdueCount).toBe(0)
    expect(summary.nextPayment?.date).toBe(day('2024-05-04'))
  })

  it('re-solves the unpaid bank rows for a what-if prepayment', () => {
    const partial = whatIf(params, paid, 8_000_000, 'reduce_term')
    expect(partial.interestSaved).toBeGreaterThan(0)
    expect(partial.newEndDate).toBeLessThan(summary.plannedEndDate!)

    // The bank accrues by days, our re-solve by rate / 12: nothing extra still saves nothing.
    expect(whatIf(params, paid, 0, 'reduce_term').interestSaved).toBe(0)
    expect(whatIf(params, paid, -300_000, 'reduce_term').interestSaved).toBe(0)

    const full = whatIf(params, paid, summary.remaining + 100, 'reduce_term')
    expect(full.interestSaved).toBeCloseTo(summary.plannedInterest, 2)
    expect(full.newEndDate).toBeNull()
  })
})

describe('loan C (1 280 000, promo rate then a low one, closed early)', () => {
  const params = toParams(loanC.params)
  const rows = generateSchedule(params, toOverrides(loanC.bankSchedule))
  const paid = reconcileSchedule(params, rows, toTrns(loanC.trns), day('2024-04-20'))
  const summary = summarizeLoan(params, paid, loanC.walletBalance)

  it('matches the bank totals', () => {
    expect(summary.paidTotal).toBe(159_111_086)
    expect(summary.paidInterest).toBe(31_111_086)
    expect(summary.paidPrincipal).toBe(128_000_000)
  })

  it('explains the whole principal and closes the loan', () => {
    expect(summary.unrecognized).toBe(0)
    expect(summary.isClosed).toBe(true)
    expect(summary.closedDate).toBe(day('2024-03-14'))
    expect(summary.nextPayment).toBeNull()
    expect(summary.plannedEndDate).toBeNull()
  })

  it('pays every row on its due date', () => {
    expect(paid.every(row => row.status === 'paid')).toBe(true)
    expect(paid[3]).toMatchObject({ date: day('2023-06-20'), paidAt: day('2023-06-20') })
  })

  it('closes the payoff day as two rows: the partial payment and the rest of the principal', () => {
    expect(paid.at(-2)).toMatchObject({ date: day('2024-03-14'), paidInterest: 140_221, paidPrincipal: 4_709_779 })
    expect(paid.at(-1)).toMatchObject({ date: day('2024-03-14'), paidInterest: 0, paidPrincipal: 67_072_293 })
  })

  // The contract rate hides the promo months; the bank's own split supports this rate.
  it('costs about 26.6% a year', () => {
    expect(summary.effectiveRate).toBe(26.6)
  })
})
