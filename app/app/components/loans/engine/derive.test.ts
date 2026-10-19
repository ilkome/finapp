import { describe, expect, it } from 'vitest'

import type { BankReport } from '~/components/bankReports/types'
import type { ScheduleOverride } from '~/components/loans/engine/types'
import type { LoanItem, LoanScheduleOverrideItem } from '~/components/loans/types'

import { bankNextPaymentAmount, createDeriveLoanMemo, deriveDue, deriveLoan, overridesByLoan, paramsOf, projectionParams } from '~/components/loans/engine/derive'

const round2 = Math.round
const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)

const loan: LoanItem = {
  annualRatePercent: 12,
  contractNumber: '',
  createdAt: 1,
  description: '',
  firstPaymentDate: day('2026-01-15'),
  interestAccrual: 'monthly',
  lateAfterDays: 3,
  paymentDayOfMonth: 15,
  prepaymentMode: 'reduce_payment',
  prepaymentWindowDays: 15,
  principalAmount: 1_200_000,
  scheduleType: 'annuity',
  startDate: day('2025-12-15'),
  termMonths: 12,
  updatedAt: 1,
  walletId: 'credit1',
}

function row(over: Partial<LoanScheduleOverrideItem>): LoanScheduleOverrideItem {
  return {
    createdAt: 1,
    dueDate: day('2026-01-15'),
    interestAmount: 12_000,
    loanId: 'l1',
    paymentNumber: 1,
    principalAmount: 90_000,
    source: 'bank',
    totalAmount: 102_000,
    updatedAt: 1,
    ...over,
  }
}

describe('paramsOf', () => {
  it('fills the rate', () => {
    expect(paramsOf(loan)).toMatchObject({
      annualRate: 12,
      firstPaymentDate: day('2026-01-15'),
      interestAccrual: 'monthly',
      lateAfterDays: 3,
      paymentDayOfMonth: 15,
      prepaymentMode: 'reduce_payment',
      prepaymentWindowDays: 15,
      principalAmount: 1_200_000,
      scheduleType: 'annuity',
      startDate: day('2025-12-15'),
      termMonths: 12,
    })
  })
})

describe('overridesByLoan', () => {
  it('groups the stored rows by loan', () => {
    const out = overridesByLoan({
      a: row({ paymentNumber: 1 }),
      b: row({ paymentNumber: 2 }),
      c: row({ loanId: 'l2', paymentNumber: 1 }),
    })

    expect([...out.keys()].sort()).toEqual(['l1', 'l2'])
    expect(out.get('l1')?.map(o => o.paymentNumber)).toEqual([1, 2])
    expect(out.get('l2')?.[0]).toMatchObject({
      date: day('2026-01-15'),
      interestPart: 12_000,
      paymentNumber: 1,
      principalPart: 90_000,
      source: 'bank',
      totalAmount: 102_000,
    })
  })

  it('is empty without rows', () => {
    expect(overridesByLoan({}).size).toBe(0)
  })
})

describe('deriveLoan', () => {
  it('reconciles one paid annuity payment and points at the next one', () => {
    const summary = deriveLoan(loan, [], [
      { amount: 12_000, date: day('2026-01-15'), id: 't1', kind: 'interest' },
      { amount: 106_619, date: day('2026-01-15'), id: 't2', kind: 'payment' },
    ], -1_105_381, day('2026-02-01'))

    expect(summary.rows).toHaveLength(12)
    expect(summary.rows[0]?.status).toBe('paid')
    expect(summary.paidPrincipal).toBe(94_619)
    expect(summary.paidInterest).toBe(12_000)
    expect(summary.nextPayment).toEqual({ amount: 106_619, date: day('2026-02-15') })
    expect(summary.isClosed).toBe(false)
  })

  it('treats a loan marked closed as closed even with a balance gap left', () => {
    const summary = deriveLoan({ ...loan, closedDate: day('2026-03-01') }, [], [
      { amount: 12_000, date: day('2026-01-15'), id: 't1', kind: 'interest' },
      { amount: 106_619, date: day('2026-01-15'), id: 't2', kind: 'payment' },
    ], -50_000, day('2026-06-01'))

    expect(summary).toMatchObject({ closedDate: day('2026-03-01'), isClosed: true, nextPayment: null, overdueCount: 0, plannedInterest: 0 })
    expect(summary.rows).toHaveLength(1)
  })

  it('accrues daily interest from an override row\'s own date', () => {
    const daily = { ...loan, interestAccrual: 'daily' as const }
    const summary = deriveLoan(daily, [{ date: day('2026-01-20'), interestPart: 13_000, paymentNumber: 1, principalPart: 87_000, source: 'bank', totalAmount: 100_000 }], [], -1_200_000, day('2026-01-01'))

    // 20.01 -> 15.02 is 26 days, not the 31 from the contract's 15.01.
    expect(summary.rows[1]?.interestPart).toBe(round2(1_113_000 * 12 / 100 * 26 / 365))
  })

  it('applies a stored override to the generated schedule', () => {
    const summary = deriveLoan(loan, [{ date: day('2026-01-20'), interestPart: 13_000, paymentNumber: 1, principalPart: 87_000, source: 'bank', totalAmount: 100_000 }], [], -1_200_000, day('2026-01-01'))

    expect(summary.rows[0]).toMatchObject({ date: day('2026-01-20'), source: 'bank', totalAmount: 100_000 })
  })
})

describe('deriveLoan without a contract rate', () => {
  const noRate = { ...loan, annualRatePercent: null }
  const paidMonth = [
    { amount: 12_000, date: day('2026-01-15'), id: 't1', kind: 'interest' as const },
    { amount: 106_619, date: day('2026-01-15'), id: 't2', kind: 'payment' as const },
  ]

  it('projects at the rate the paid interest implies', () => {
    const summary = deriveLoan(noRate, [], paidMonth, -1_105_381, day('2026-02-01'))

    expect(summary.projectionRate).toBeCloseTo(12, 0)
    expect(summary.plannedInterest).toBeGreaterThan(0)
    expect(projectionParams(noRate, summary)?.annualRate).toBe(summary.projectionRate)
  })

  it('projects at the rate a bank schedule implies before any payment', () => {
    const summary = deriveLoan(noRate, [{ date: day('2026-01-15'), interestPart: 12_000, paymentNumber: 1, principalPart: 94_619, source: 'bank', totalAmount: 106_619 }], [], -1_200_000, day('2026-01-01'))
    expect(summary.projectionRate).toBeCloseTo(12, 0)
  })

  it('has nothing to project at with neither', () => {
    const summary = deriveLoan(noRate, [], [], -1_200_000, day('2026-01-01'))

    expect(summary.projectionRate).toBeNull()
    expect(projectionParams(noRate, summary)).toBeNull()
  })
})

describe('deriveDue', () => {
  const today = day('2026-09-23')
  const summary = ({ nextPayment, ...over }: { isClosed?: boolean, nextPayment?: { amount: number, date: number }, rows?: object[] }) => ({
    isClosed: false,
    rows: nextPayment ? [{ date: nextPayment.date, paidInterest: 0, paidPrincipal: 0, status: nextPayment.date < today ? 'overdue' : 'scheduled', totalAmount: nextPayment.amount }] : [],
    ...over,
  } as any)
  const entry = (over: object, currency = 'USD') => ({ currency, walletId: 'credit1', ...over } as any)

  it('is null with nothing due', () => {
    expect(deriveDue([], [], today)).toBeNull()
  })

  it('adds the next payment of an open loan and skips a closed one', () => {
    expect(deriveDue([
      entry({ summary: summary({ nextPayment: { amount: 100_000, date: day('2026-10-05') } }) }),
      entry({ summary: summary({ isClosed: true, nextPayment: { amount: 50_000, date: day('2026-09-25') } }), walletId: 'credit2' }),
    ], [], today)).toEqual({ amount: 100_000, nearestDate: day('2026-10-05') })
  })

  it('skips a loan payment past the 31 day window', () => {
    expect(deriveDue([
      entry({ summary: summary({ nextPayment: { amount: 70_000, date: day('2026-10-24') } }) }),
    ], [], today)).toBeNull()
  })

  it('keeps an overdue loan payment', () => {
    expect(deriveDue([
      entry({ summary: summary({ nextPayment: { amount: 70_000, date: day('2026-09-10') } }) }),
    ], [], today)).toEqual({ amount: 70_000, nearestDate: day('2026-09-10') })
  })

  it('adds every overdue row, what a partial row still owes and the next scheduled one', () => {
    const rows = [
      { date: day('2026-07-10'), paidInterest: 0, paidPrincipal: 0, status: 'overdue', totalAmount: 70_000 },
      { date: day('2026-08-10'), paidInterest: 10_000, paidPrincipal: 20_000, status: 'partial', totalAmount: 70_000 },
      { date: day('2026-09-10'), paidInterest: 0, paidPrincipal: 0, status: 'overdue', totalAmount: 70_000 },
      { date: day('2026-10-10'), paidInterest: 0, paidPrincipal: 0, status: 'scheduled', totalAmount: 70_000 },
      { date: day('2026-10-12'), paidInterest: 0, paidPrincipal: 0, status: 'scheduled', totalAmount: 70_000 },
    ]
    expect(deriveDue([entry({ summary: summary({ rows }) })], [], today)).toEqual({ amount: 250_000, nearestDate: day('2026-07-10') })
  })

  it('adds every row due on the next payment day', () => {
    const rows = [
      { date: day('2026-10-15'), paidInterest: 0, paidPrincipal: 0, status: 'scheduled', totalAmount: 70_000 },
      { date: day('2026-10-15'), paidInterest: 0, paidPrincipal: 0, status: 'scheduled', totalAmount: 5000 },
      { date: day('2026-10-20'), paidInterest: 0, paidPrincipal: 0, status: 'scheduled', totalAmount: 70_000 },
    ]
    expect(deriveDue([entry({ summary: summary({ rows }) })], [], today)).toEqual({ amount: 75_000, nearestDate: day('2026-10-15') })
  })

  it('adds a revolving minimum payment inside the window and skips only the ones past it', () => {
    expect(deriveDue([], [
      { currency: 'USD', minPaymentAmount: 320_000, minPaymentDate: day('2026-09-25'), walletId: 'card' },
      { currency: 'USD', minPaymentAmount: 50_000, minPaymentDate: day('2026-11-05'), walletId: 'later' },
    ], today)).toEqual({ amount: 320_000, nearestDate: day('2026-09-25') })
  })

  it('keeps an overdue revolving minimum payment', () => {
    expect(deriveDue([], [
      { currency: 'USD', minPaymentAmount: 9000, minPaymentDate: day('2026-09-01'), walletId: 'past' },
      { currency: 'USD', minPaymentAmount: 320_000, minPaymentDate: day('2026-09-25'), walletId: 'card' },
    ], today)).toEqual({ amount: 329_000, nearestDate: day('2026-09-01') })
  })

  it('sums both sources and reports the nearest date', () => {
    expect(deriveDue([
      entry({ summary: summary({ nextPayment: { amount: 100_000, date: day('2026-10-05') } }) }),
    ], [
      { currency: 'USD', minPaymentAmount: 20_000, minPaymentDate: day('2026-09-28'), walletId: 'card' },
    ], today)).toEqual({ amount: 120_000, nearestDate: day('2026-09-28') })
  })

  it('converts every amount to the base currency and leaves the nearest date alone', () => {
    const toBase = (amount: number, currency: string) => (currency === 'EUR' ? amount * 2 : amount)

    expect(deriveDue([
      entry({ summary: summary({ nextPayment: { amount: 100_000, date: day('2026-10-05') } }) }, 'EUR'),
    ], [
      { currency: 'USD', minPaymentAmount: 20_000, minPaymentDate: day('2026-09-28'), walletId: 'card' },
    ], today, toBase)).toEqual({ amount: 220_000, nearestDate: day('2026-09-28') })
  })
})

describe('bankNextPaymentAmount', () => {
  const next = { date: day('2026-10-01') }
  const bank = { nextInterestAmount: 500_000, nextPaymentDate: day('2026-10-01'), nextPrincipalAmount: 1 } as BankReport

  it('uses the bank split for the same day', () => {
    expect(bankNextPaymentAmount(bank, next)).toBe(500_001)
  })

  it('falls back to the engine for another day or without a split', () => {
    expect(bankNextPaymentAmount(bank, { date: day('2026-11-01') })).toBeNull()
    expect(bankNextPaymentAmount(undefined, next)).toBeNull()
    expect(bankNextPaymentAmount(bank, null)).toBeNull()
  })

  it('replaces the engine amount of the next payment, which deriveDue then counts', () => {
    const summary = deriveLoan(loan, [], [], -1_200_000, day('2026-01-01'), { nextInterestAmount: 12_000, nextPaymentDate: day('2026-01-15'), nextPrincipalAmount: 90_050 } as BankReport)
    expect(summary.nextPayment).toEqual({ amount: 102_050, date: day('2026-01-15') })
    expect(deriveDue([{ currency: 'RUB', summary, walletId: 'credit1' }], [], day('2026-01-01'))?.amount).toBe(102_050)
  })
})

describe('createDeriveLoanMemo', () => {
  const overrides: ScheduleOverride[] = []
  const payment = { amount: 106_500, date: day('2026-01-15'), id: 't1', kind: 'payment' as const }

  it('reuses the summary while the loan inputs are unchanged', () => {
    const derive = createDeriveLoanMemo()
    const first = derive('l1', loan, overrides, [payment], -1_100_000, day('2026-02-01'))

    expect(derive('l1', loan, overrides, [{ ...payment }], -1_100_000, day('2026-02-01'))).toBe(first)
  })

  it('re-derives when one of its trns, the balance, the day or the loan changes', () => {
    const derive = createDeriveLoanMemo()
    const first = derive('l1', loan, overrides, [payment], -1_100_000, day('2026-02-01'))

    const byTrn = derive('l1', loan, overrides, [{ ...payment, amount: 110_000 }], -1_100_000, day('2026-02-01'))
    expect(byTrn).not.toBe(first)
    expect(byTrn).toEqual(deriveLoan(loan, overrides, [{ ...payment, amount: 110_000 }], -1_100_000, day('2026-02-01')))
    expect(derive('l1', loan, overrides, [{ ...payment, amount: 110_000 }], -1_090_000, day('2026-02-01'))).not.toBe(byTrn)
    expect(derive('l1', loan, overrides, [{ ...payment, amount: 110_000 }], -1_090_000, day('2026-02-02'))).not.toBe(byTrn)
    expect(derive('l1', { ...loan }, overrides, [{ ...payment, amount: 110_000 }], -1_090_000, day('2026-02-02'))).not.toBe(byTrn)
  })

  it('forgets a pruned loan', () => {
    const derive = createDeriveLoanMemo()
    const first = derive('l1', loan, overrides, [payment], -1_100_000, day('2026-02-01'))
    derive.prune(new Set())
    expect(derive('l1', loan, overrides, [payment], -1_100_000, day('2026-02-01'))).not.toBe(first)
  })
})
