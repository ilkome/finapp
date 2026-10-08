import { describe, expect, it } from 'vitest'

import type { LoanParams, LoanTrn, LoanTrnKind, OverpaymentMode, ScheduleOverride, ScheduleType } from '~/components/loans/engine/types'

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
    ...raw,
    firstPaymentDate: day(raw.firstPaymentDate),
    overpaymentMode: raw.overpaymentMode as OverpaymentMode,
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
    expect(rows[1]).toMatchObject({ date: day('2023-01-17'), interestPart: 8487.14, totalAmount: 13_918.91 })
    expect(rows[3]).toMatchObject({ date: day('2023-03-17'), principalPart: 0, totalAmount: 0 })
    expect(rows[3]?.remainingBalance).toBe(rows[2]?.remainingBalance)
    // Principal left after the interest-only months, the bank says 523 431.01.
    expect(rows[6]?.date).toBe(day('2023-06-17'))
    expect(rows[6]?.remainingBalance).toBe(523_431.01)
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
    expect(summary.paidTotal).toBeCloseTo(80_357.36, 2)
    expect(summary.paidPrincipal).toBeCloseTo(20_618, 0)
    expect(summary.paidInterest).toBeCloseTo(59_739, 0)
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
    const partial = whatIf(params, paid, 80_000, 'reduceTerm')
    expect(partial.interestSaved).toBeGreaterThan(0)
    expect(partial.newEndDate).toBeLessThan(summary.plannedEndDate!)

    // The bank accrues by days, our re-solve by rate / 12: nothing extra still saves nothing.
    expect(whatIf(params, paid, 0, 'reduceTerm').interestSaved).toBe(0)

    const full = whatIf(params, paid, summary.remaining + 1, 'reduceTerm')
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
    expect(summary.paidTotal).toBe(1_591_110.86)
    expect(summary.paidInterest).toBe(311_110.86)
    expect(summary.paidPrincipal).toBe(1_280_000)
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
    expect(paid.at(-2)).toMatchObject({ date: day('2024-03-14'), paidInterest: 1402.21, paidPrincipal: 47_097.79 })
    expect(paid.at(-1)).toMatchObject({ date: day('2024-03-14'), paidInterest: 0, paidPrincipal: 670_722.93 })
  })

  // The contract rate hides the promo months; the bank's own split supports this rate.
  it('costs about 26.6% a year', () => {
    expect(summary.effectiveRate).toBe(26.6)
  })
})
