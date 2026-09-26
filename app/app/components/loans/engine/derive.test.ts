import { describe, expect, it } from 'vitest'

import type { ScheduleOverride } from '~/components/loans/engine/types'
import type { LoanItem, LoanScheduleRowItem } from '~/components/loans/types'

import { bankNextPaymentAmount, createDeriveLoanMemo, deriveDue, deriveLoan, overridesByLoan, paramsOf, projectionParams } from '~/components/loans/engine/derive'

const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)

const loan: LoanItem = {
  annualRate: 12,
  contractNumber: '',
  desc: '',
  firstPaymentDate: day('2026-01-15'),
  interestMethod: 'monthly',
  lateAfterDays: 3,
  overpaymentMode: 'reducePayment',
  paymentDay: 15,
  prepayWindowDays: 15,
  principalAmount: 12_000,
  scheduleType: 'annuity',
  startDate: day('2025-12-15'),
  termMonths: 12,
  updatedAt: 1,
  walletId: 'credit1',
}

function row(over: Partial<LoanScheduleRowItem>): LoanScheduleRowItem {
  return {
    date: day('2026-01-15'),
    interestPart: 120,
    loanId: 'l1',
    paymentNumber: 1,
    principalPart: 900,
    source: 'bank',
    totalAmount: 1020,
    updatedAt: 1,
    ...over,
  }
}

describe('paramsOf', () => {
  it('keeps only the contract fields', () => {
    expect(paramsOf(loan)).toEqual({
      annualRate: 12,
      firstPaymentDate: day('2026-01-15'),
      interestMethod: 'monthly',
      lateAfterDays: 3,
      overpaymentMode: 'reducePayment',
      paymentDay: 15,
      prepayWindowDays: 15,
      principalAmount: 12_000,
      scheduleType: 'annuity',
      startDate: day('2025-12-15'),
      termMonths: 12,
    })
  })
})

describe('overridesByLoan', () => {
  it('groups the stored rows by loan and drops the storage fields', () => {
    const out = overridesByLoan({
      a: row({ paymentNumber: 1 }),
      b: row({ paymentNumber: 2 }),
      c: row({ loanId: 'l2', paymentNumber: 1 }),
    })

    expect([...out.keys()].sort()).toEqual(['l1', 'l2'])
    expect(out.get('l1')?.map(o => o.paymentNumber)).toEqual([1, 2])
    expect(out.get('l2')?.[0]).toEqual({
      date: day('2026-01-15'),
      interestPart: 120,
      paymentNumber: 1,
      principalPart: 900,
      source: 'bank',
      totalAmount: 1020,
    })
  })

  it('is empty without rows', () => {
    expect(overridesByLoan({}).size).toBe(0)
  })
})

describe('deriveLoan', () => {
  it('reconciles one paid annuity payment and points at the next one', () => {
    const summary = deriveLoan(loan, [], [
      { amount: 120, date: day('2026-01-15'), id: 't1', kind: 'interest' },
      { amount: 1066.19, date: day('2026-01-15'), id: 't2', kind: 'payment' },
    ], -11_053.81, day('2026-02-01'))

    expect(summary.rows).toHaveLength(12)
    expect(summary.rows[0]?.status).toBe('paid')
    expect(summary.paidPrincipal).toBe(946.19)
    expect(summary.paidInterest).toBe(120)
    expect(summary.nextPayment).toEqual({ amount: 1066.19, date: day('2026-02-15') })
    expect(summary.isClosed).toBe(false)
  })

  it('applies a stored override to the generated schedule', () => {
    const summary = deriveLoan(loan, [{ date: day('2026-01-20'), interestPart: 130, paymentNumber: 1, principalPart: 870, source: 'bank', totalAmount: 1000 }], [], -12_000, day('2026-01-01'))

    expect(summary.rows[0]).toMatchObject({ date: day('2026-01-20'), source: 'bank', totalAmount: 1000 })
  })
})

describe('deriveLoan without a contract rate', () => {
  const noRate = { ...loan, annualRate: null }
  const paidMonth = [
    { amount: 120, date: day('2026-01-15'), id: 't1', kind: 'interest' as const },
    { amount: 1066.19, date: day('2026-01-15'), id: 't2', kind: 'payment' as const },
  ]

  it('projects at the rate the paid interest implies', () => {
    const summary = deriveLoan(noRate, [], paidMonth, -11_053.81, day('2026-02-01'))

    expect(summary.projectionRate).toBeCloseTo(12, 0)
    expect(summary.plannedInterest).toBeGreaterThan(0)
    expect(projectionParams(noRate, summary)?.annualRate).toBe(summary.projectionRate)
  })

  it('projects at the rate a bank schedule implies before any payment', () => {
    const summary = deriveLoan(noRate, [{ date: day('2026-01-15'), interestPart: 120, paymentNumber: 1, principalPart: 946.19, source: 'bank', totalAmount: 1066.19 }], [], -12_000, day('2026-01-01'))
    expect(summary.projectionRate).toBeCloseTo(12, 0)
  })

  it('has nothing to project at with neither', () => {
    const summary = deriveLoan(noRate, [], [], -12_000, day('2026-01-01'))

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
      entry({ summary: summary({ nextPayment: { amount: 1000, date: day('2026-10-05') } }) }),
      entry({ summary: summary({ isClosed: true, nextPayment: { amount: 500, date: day('2026-09-25') } }), walletId: 'credit2' }),
    ], [], today)).toEqual({ amount: 1000, nearestDate: day('2026-10-05') })
  })

  it('skips a loan payment past the 31 day window', () => {
    expect(deriveDue([
      entry({ summary: summary({ nextPayment: { amount: 700, date: day('2026-10-24') } }) }),
    ], [], today)).toBeNull()
  })

  it('keeps an overdue loan payment', () => {
    expect(deriveDue([
      entry({ summary: summary({ nextPayment: { amount: 700, date: day('2026-09-10') } }) }),
    ], [], today)).toEqual({ amount: 700, nearestDate: day('2026-09-10') })
  })

  it('adds every overdue row, what a partial row still owes and the next scheduled one', () => {
    const rows = [
      { date: day('2026-07-10'), paidInterest: 0, paidPrincipal: 0, status: 'overdue', totalAmount: 700 },
      { date: day('2026-08-10'), paidInterest: 100, paidPrincipal: 200, status: 'partial', totalAmount: 700 },
      { date: day('2026-09-10'), paidInterest: 0, paidPrincipal: 0, status: 'overdue', totalAmount: 700 },
      { date: day('2026-10-10'), paidInterest: 0, paidPrincipal: 0, status: 'scheduled', totalAmount: 700 },
      { date: day('2026-10-12'), paidInterest: 0, paidPrincipal: 0, status: 'scheduled', totalAmount: 700 },
    ]
    expect(deriveDue([entry({ summary: summary({ rows }) })], [], today)).toEqual({ amount: 2500, nearestDate: day('2026-07-10') })
  })

  it('adds a revolving minimum payment inside the window and skips only the ones past it', () => {
    expect(deriveDue([], [
      { currency: 'USD', minPaymentAmount: 3200, minPaymentDate: day('2026-09-25'), walletId: 'card' },
      { currency: 'USD', minPaymentAmount: 500, minPaymentDate: day('2026-11-05'), walletId: 'later' },
    ], today)).toEqual({ amount: 3200, nearestDate: day('2026-09-25') })
  })

  it('keeps an overdue revolving minimum payment', () => {
    expect(deriveDue([], [
      { currency: 'USD', minPaymentAmount: 90, minPaymentDate: day('2026-09-01'), walletId: 'past' },
      { currency: 'USD', minPaymentAmount: 3200, minPaymentDate: day('2026-09-25'), walletId: 'card' },
    ], today)).toEqual({ amount: 3290, nearestDate: day('2026-09-01') })
  })

  it('sums both sources and reports the nearest date', () => {
    expect(deriveDue([
      entry({ summary: summary({ nextPayment: { amount: 1000, date: day('2026-10-05') } }) }),
    ], [
      { currency: 'USD', minPaymentAmount: 200, minPaymentDate: day('2026-09-28'), walletId: 'card' },
    ], today)).toEqual({ amount: 1200, nearestDate: day('2026-09-28') })
  })

  it('converts every amount to the base currency and leaves the nearest date alone', () => {
    const toBase = (amount: number, currency: string) => (currency === 'EUR' ? amount * 2 : amount)

    expect(deriveDue([
      entry({ summary: summary({ nextPayment: { amount: 1000, date: day('2026-10-05') } }) }, 'EUR'),
    ], [
      { currency: 'USD', minPaymentAmount: 200, minPaymentDate: day('2026-09-28'), walletId: 'card' },
    ], today, toBase)).toEqual({ amount: 2200, nearestDate: day('2026-09-28') })
  })
})

describe('bankNextPaymentAmount', () => {
  const next = { date: day('2026-10-01') }
  const bank = { ...loan, nextPaymentDate: day('2026-10-01'), nextPaymentInterest: 5000, nextPaymentPrincipal: 0.01 }

  it('uses the bank split for the same day', () => {
    expect(bankNextPaymentAmount(bank, next)).toBe(5000.01)
  })

  it('falls back to the engine for another day or without a split', () => {
    expect(bankNextPaymentAmount(bank, { date: day('2026-11-01') })).toBeNull()
    expect(bankNextPaymentAmount(loan, next)).toBeNull()
    expect(bankNextPaymentAmount(bank, null)).toBeNull()
  })

  it('replaces the engine amount in deriveDue', () => {
    const summary = { isClosed: false, rows: [{ date: day('2026-10-01'), paidInterest: 0, paidPrincipal: 0, status: 'scheduled', totalAmount: 8000 }] } as any
    expect(deriveDue([{ bankAmount: 5000.01, currency: 'RUB', summary, walletId: 'credit1' }], [], day('2026-09-23'))?.amount).toBe(5000.01)
  })
})

describe('createDeriveLoanMemo', () => {
  const overrides: ScheduleOverride[] = []
  const payment = { amount: 1065, date: day('2026-01-15'), id: 't1', kind: 'payment' as const }

  it('reuses the summary while the loan inputs are unchanged', () => {
    const derive = createDeriveLoanMemo()
    const first = derive('l1', loan, overrides, [payment], -11_000, day('2026-02-01'))

    expect(derive('l1', loan, overrides, [{ ...payment }], -11_000, day('2026-02-01'))).toBe(first)
  })

  it('re-derives when one of its trns, the balance, the day or the loan changes', () => {
    const derive = createDeriveLoanMemo()
    const first = derive('l1', loan, overrides, [payment], -11_000, day('2026-02-01'))

    const byTrn = derive('l1', loan, overrides, [{ ...payment, amount: 1100 }], -11_000, day('2026-02-01'))
    expect(byTrn).not.toBe(first)
    expect(byTrn).toEqual(deriveLoan(loan, overrides, [{ ...payment, amount: 1100 }], -11_000, day('2026-02-01')))
    expect(derive('l1', loan, overrides, [{ ...payment, amount: 1100 }], -10_900, day('2026-02-01'))).not.toBe(byTrn)
    expect(derive('l1', loan, overrides, [{ ...payment, amount: 1100 }], -10_900, day('2026-02-02'))).not.toBe(byTrn)
    expect(derive('l1', { ...loan }, overrides, [{ ...payment, amount: 1100 }], -10_900, day('2026-02-02'))).not.toBe(byTrn)
  })
})
