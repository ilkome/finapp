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

describe('loan A (900 000 at 22.6%, daily interest)', () => {
  const params = toParams(loanA.params)
  const bank = toOverrides(loanA.bankSchedule)

  it('generates 65 payments from the first payment date to the contract end', () => {
    const rows = generateSchedule(params)

    expect(rows).toHaveLength(65)
    expect(rows[0]?.date).toBe(day('2025-03-01'))
    expect(rows.at(-1)?.date).toBe(day('2030-07-01'))
    // The bank's own payment is 23 508.58, which a rate/12 annuity cannot reproduce: the bank charges
    // interest daily on actual/365 (row 1 is about 900 000 * 22.6% * 28/365 = 15 603.28). The generator
    // stays self-consistent instead: one fixed payment that clears the debt exactly.
    expect(rows.slice(0, 64).every(row => row.totalAmount === rows[0]?.totalAmount)).toBe(true)
    expect(rows.at(-1)?.remainingBalance).toBe(0)
  })

  it('reproduces the bank schedule from overrides, holiday row included', () => {
    const rows = generateSchedule(params, bank)

    expect(rows).toHaveLength(65)
    expect(rows[1]).toMatchObject({ date: day('2025-04-01'), totalAmount: 22_763.23 })
    expect(rows[3]).toMatchObject({ date: day('2025-06-01'), principalPart: 0, totalAmount: 0 })
    expect(rows[3]?.remainingBalance).toBe(rows[2]?.remainingBalance)
    // Principal left on the report date (2026-09-22), the bank says 879 858.99.
    expect(rows[6]?.date).toBe(day('2025-09-01'))
    expect(rows[6]?.remainingBalance).toBe(879_858.99)
  })

  it('pushes the term one month out when only the holiday months come from the bank', () => {
    const rows = generateSchedule(params, bank.slice(0, 4))

    expect(rows).toHaveLength(66)
    expect(rows.at(-1)?.date).toBe(day('2030-08-01'))
    expect(rows.at(-1)?.remainingBalance).toBe(0)
  })
})

describe('loan B (708 000 at 22.64%, holiday and top-ups)', () => {
  const params = toParams(loanB.params)
  const rows = generateSchedule(params, toOverrides(loanB.bankSchedule))
  const paid = reconcileSchedule(params, rows, toTrns(loanB.trns), day('2025-09-22'))
  const summary = summarizeLoan(params, paid, loanB.walletBalance)

  it('splits the feed by the bank schedule rows', () => {
    expect(summary.paidTotal).toBeCloseTo(180_370.03, 2)
    expect(summary.paidPrincipal).toBeCloseTo(35_776, 0)
    expect(summary.paidInterest).toBeCloseTo(144_594, 0)
    expect(summary.unrecognized).toBe(0)
    expect(summary.isClosed).toBe(false)
  })

  it('lands the two early payments in their own rows', () => {
    expect(paid[1]?.trnIds).toContain('b2i')
    expect(paid[4]?.trnIds).toContain('b6i')
  })

  it('treats the June holiday row as settled and keeps the tail scheduled', () => {
    expect(paid[10]).toMatchObject({ date: day('2025-06-01'), status: 'paid', totalAmount: 0 })
    expect(paid[13]?.status).toBe('paid')
    expect(paid[14]?.status).toBe('scheduled')
    expect(summary.overdueCount).toBe(0)
    expect(summary.nextPayment?.date).toBe(day('2025-10-01'))
  })

  it('re-solves the unpaid bank rows for a what-if prepayment', () => {
    const partial = whatIf(params, paid, 150_000, 'reduceTerm', day('2025-09-22'))
    expect(partial.interestSaved).toBeGreaterThan(0)
    expect(partial.newEndDate).toBeLessThan(summary.plannedEndDate!)

    const full = whatIf(params, paid, summary.remaining + 1, 'reduceTerm', day('2025-09-22'))
    expect(full.interestSaved).toBeCloseTo(summary.plannedInterest, 2)
    expect(full.newEndDate).toBe(day('2025-09-22'))
  })
})

describe('loan C (1 950 000, no published rate, closed early)', () => {
  const params = toParams(loanC.params)
  const rows = generateSchedule(params, toOverrides(loanC.bankSchedule))
  const paid = reconcileSchedule(params, rows, toTrns(loanC.trns), day('2025-09-22'))
  const summary = summarizeLoan(params, paid, loanC.walletBalance)

  it('matches the bank totals', () => {
    expect(summary.paidTotal).toBe(2_514_982.78)
    // The bank's own full cost of credit (pskSum).
    expect(summary.paidInterest).toBe(564_982.78)
    expect(summary.paidPrincipal).toBe(1_950_000)
  })

  it('explains the whole principal and closes the loan', () => {
    expect(summary.unrecognized).toBe(0)
    expect(summary.isClosed).toBe(true)
    expect(summary.nextPayment).toBeNull()
    expect(summary.plannedEndDate).toBeNull()
  })

  it('pays every row on its due date', () => {
    expect(paid.every(row => row.status === 'paid')).toBe(true)
    expect(paid[3]).toMatchObject({ date: day('2024-10-11'), paidAt: day('2024-10-11') })
  })

  it('closes the payoff day as two rows: the partial payment and the rest of the principal', () => {
    expect(paid.at(-2)).toMatchObject({ date: day('2025-07-07'), paidInterest: 2870.52, paidPrincipal: 61_279.05 })
    expect(paid.at(-1)).toMatchObject({ date: day('2025-07-07'), paidInterest: 0, paidPrincipal: 1_318_781.34 })
  })

  // The bank publishes no contract rate; this is the only rate the bank's own split supports.
  it('costs about 27% a year', () => {
    expect(summary.effectiveRate).toBe(27.24)
  })
})
