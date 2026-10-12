import { describe, expect, it } from 'vitest'

import type { LoanSummary, PaymentRow, ScheduleRow } from '~/components/loans/engine/types'

import { closeSummary, effectiveRateOf, impliedRate, owedOf } from '~/components/loans/engine/summary'

function row(over: Partial<PaymentRow>): PaymentRow {
  return {
    date: 0,
    interestPart: 100,
    lastPaymentAt: null,
    paidAt: null,
    paidFine: 0,
    paidInterest: 0,
    paidPrincipal: 0,
    paymentNumber: 1,
    principalPart: 900,
    remainingBalance: 0,
    source: 'generated',
    status: 'scheduled',
    totalAmount: 1000,
    trnIds: [],
    ...over,
  }
}

describe('impliedRate', () => {
  it('reads the rate off the regular bank rows only', () => {
    const rows: ScheduleRow[] = [
      // 100 interest on 10 000 opening balance: 1% a month, 12% a year.
      row({ interestPart: 100, principalPart: 900, remainingBalance: 9100, source: 'bank' }),
      row({ interestPart: 30, principalPart: 0, remainingBalance: 9100, source: 'bank' }),
      row({ interestPart: 500, principalPart: 900, remainingBalance: 8200, source: 'generated' }),
    ]
    expect(impliedRate(rows)).toBe(12)
  })
})

describe('closeSummary', () => {
  it('drops the unpaid plan and zeroes everything projected', () => {
    const summary = {
      nextPayment: { amount: 1000, date: 2 },
      overdueCount: 1,
      plannedEndDate: 5,
      plannedInterest: 300,
      plannedTotal: 3000,
      rows: [row({ status: 'paid' }), row({ status: 'overdue' })],
    } as LoanSummary

    expect(closeSummary(summary, 9)).toMatchObject({
      closedDate: 9,
      isClosed: true,
      monthsLeft: 0,
      nextPayment: null,
      overdueCount: 0,
      plannedEndDate: null,
      plannedInterest: 0,
      plannedTotal: 0,
      rows: [{ status: 'paid' }],
    })
  })
})

describe('owedOf', () => {
  it('owes what a partial payment left', () => {
    expect(owedOf(row({ paidInterest: 100, paidPrincipal: 300, status: 'partial' }))).toBe(600)
    expect(owedOf(row({ paidInterest: 100, paidPrincipal: 950 }))).toBe(0)
  })
})

describe('effectiveRateOf', () => {
  it('opens each month on the real balance left after a prepayment', () => {
    const rows = [
      // 10 000 opening, prepaid down to 5 000.
      row({ paidInterest: 100, remainingBalance: 5000, status: 'paid' }),
      row({ paidInterest: 50, remainingBalance: 4000, status: 'paid' }),
    ]
    // (150 / 2 months) / avg(10 000, 5 000) * 12 * 100 = 12%.
    expect(effectiveRateOf(rows, 10_000)).toBe(12)
    expect(effectiveRateOf(rows, 10_000, r => r.paidInterest > 60)).toBe(12)
  })
})
