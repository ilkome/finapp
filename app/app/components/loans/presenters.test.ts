import { describe, expect, it, vi } from 'vitest'

import fixture from '~/components/demo/loans/presenterInputs.json'
import { shownEffectiveRate, toCostProps, toScheduleViewRows, toSummaryProps } from '~/components/loans/presenters'

const day = (ms: number) => new Date(ms).toISOString().slice(0, 10)

describe('toSummaryProps', () => {
  it('maps the loan and summary into the view props, formatting dates', () => {
    const props = toSummaryProps({
      currencyCode: 'RUB',
      day,
      debitBalance: 0,
      loan: fixture.loan as any,
      summary: fixture.summary as any,
      today: 0,
    })

    expect(props.contractRate).toBe(24.5)
    expect(props.overpaid).toBe(fixture.summary.paidInterest + fixture.summary.paidFine)
    expect(props.overpaidShare).toBeCloseTo(props.overpaid / 350000)
    expect(props.nextPayment).toEqual({ amount: 12500, date: day(fixture.summary.nextPayment.date) })
    expect(props.plannedEndDate).toBe(day(fixture.summary.plannedEndDate))
    expect(props.debitShortfall).toBe(12500)
    expect(props.bankDebt).toBeNull()
  })

  it('takes the next payment amount from the bank split for the same day', () => {
    const props = toSummaryProps({
      currencyCode: 'RUB',
      day,
      debitBalance: null,
      loan: { ...fixture.loan, nextPaymentDate: fixture.summary.nextPayment.date, nextPaymentInterest: 8000, nextPaymentPrincipal: 2500 } as any,
      summary: fixture.summary as any,
      today: 0,
    })
    expect(props.nextPayment?.amount).toBe(10500)
  })

  it('checks the wallet against the bank debt when bank sync pushed one', () => {
    const props = toSummaryProps({
      currencyCode: 'RUB',
      day,
      debitBalance: 0,
      loan: { ...fixture.loan, bankDebtAmount: fixture.summary.remaining - 500, bankDebtUpdatedAt: 0 } as any,
      summary: fixture.summary as any,
      today: 0,
    })
    expect(props.bankDebt).toEqual({ date: day(0), diff: 500, isStale: false })
  })

  it('has no shortfall when the debit balance covers the next payment', () => {
    const props = toSummaryProps({
      currencyCode: 'RUB',
      day,
      debitBalance: 999999,
      loan: fixture.loan as any,
      summary: fixture.summary as any,
      today: 0,
    })
    expect(props.debitShortfall).toBeNull()
  })
})

describe('shownEffectiveRate', () => {
  it('shows the effective rate only without a contract rate or off it by more than 0.5 pp', () => {
    expect(shownEffectiveRate(null, 27.24)).toBe(27.24)
    expect(shownEffectiveRate(24.5, 25)).toBeNull()
    expect(shownEffectiveRate(24.5, 24)).toBeNull()
    expect(shownEffectiveRate(24.5, 25.1)).toBe(25.1)
    expect(shownEffectiveRate(0, 0)).toBeNull()
  })
})

describe('toScheduleViewRows', () => {
  it('uses paid amounts for settled rows and plan amounts otherwise, flagging resettable overrides', () => {
    const rows = toScheduleViewRows(fixture.summary.rows as any, new Set([2]), day)

    expect(rows[0]).toMatchObject({ amount: 12500, canReset: false, isPayable: false, status: 'paid' })
    expect(rows[1]).toMatchObject({ amount: 5000, canReset: true, delta: -7507.34, isPayable: true, status: 'partial' })
    expect(rows[2]).toMatchObject({ amount: 12500, canReset: false, isPayable: true, status: 'scheduled' })
  })

  it('memoizes day() per row.date so repeated recomputes do not reformat the same date', () => {
    const daySpy = vi.fn(day)
    toScheduleViewRows(fixture.summary.rows as any, new Set(), daySpy)
    const callsAfterFirstRun = daySpy.mock.calls.length
    toScheduleViewRows(fixture.summary.rows as any, new Set(), daySpy)
    expect(daySpy.mock.calls.length).toBe(callsAfterFirstRun)
  })
})

describe('toCostProps', () => {
  it('maps the monthly cost, formatting each bucket month', () => {
    const props = toCostProps(fixture.cost as any, 'RUB', day)
    expect(props).toEqual({
      byMonth: fixture.cost.byMonth.map(item => ({ fine: item.fine, interest: item.interest, month: day(item.month) })),
      currencyCode: 'RUB',
      fine: 30,
      interest: 19550.16,
    })
  })

  it('falls back to zeros when there is no cost yet', () => {
    const props = toCostProps(undefined, 'RUB', day)
    expect(props).toEqual({ byMonth: [], currencyCode: 'RUB', fine: 0, interest: 0 })
  })
})
