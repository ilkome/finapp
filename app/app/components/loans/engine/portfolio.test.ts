import { describe, expect, it } from 'vitest'

import type { PortfolioLoan } from '~/components/loans/engine/portfolio'
import type { LoanItem } from '~/components/loans/types'

import { deriveLoan, paramsOf } from '~/components/loans/engine/derive'
import { costOf } from '~/components/loans/engine/ledger'
import { derivePortfolio } from '~/components/loans/engine/portfolio'

const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)
const today = day('2026-04-01')

function loanItem(over: Partial<LoanItem>): LoanItem {
  return {
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
    walletId: 'w1',
    ...over,
  }
}

/** A loan with three paid months, built through the real engine so `rows` drive `whatIf`. */
function portfolioLoan(over: Partial<LoanItem>, currency: string, balance: number, name: string): PortfolioLoan {
  const loan = loanItem(over)
  const trns = [1, 2, 3].map(n => ({
    amount: 100,
    date: day(`2026-0${n}-15`),
    id: `i${n}${loan.walletId}`,
    kind: 'interest' as const,
  }))
  const principal = [1, 2, 3].map(n => ({
    amount: 1000,
    date: day(`2026-0${n}-15`),
    id: `p${n}${loan.walletId}`,
    kind: 'payment' as const,
  }))

  return {
    annualRate: loan.annualRate,
    cost: costOf([...trns, ...principal]),
    currency,
    name,
    params: paramsOf(loan),
    summary: deriveLoan(loan, [], [...trns, ...principal], balance, today),
    walletId: loan.walletId,
  }
}

// 1 USD = 100 RUB; the base currency is RUB.
const toBase = (amount: number, currency: string) => currency === 'USD' ? amount * 100 : amount
const fromBase = (amount: number, currency: string) => currency === 'USD' ? amount / 100 : amount

const rub = portfolioLoan({ walletId: 'w1' }, 'RUB', -9300, 'Rub loan')
const usd = portfolioLoan({ annualRate: 20, walletId: 'w2' }, 'USD', -93, 'Usd loan')

const input = { extra: 1000, fromBase, loans: [rub, usd], toBase, today }

describe('derivePortfolio', () => {
  it('totals every loan in the base currency', () => {
    const { totals } = derivePortfolio(input)

    expect(totals.remaining).toBe(rub.summary.remaining + usd.summary.remaining * 100)
    expect(totals.paidInterest).toBe(rub.summary.paidInterest + usd.summary.paidInterest * 100)
    expect(totals.paidTotal).toBe(rub.summary.paidTotal + usd.summary.paidTotal * 100)
    expect(totals.plannedInterest).toBe(rub.summary.plannedInterest + usd.summary.plannedInterest * 100)
    expect(totals.paidFine).toBe(0)
  })

  it('keeps native and base amounts side by side and shares interest across the portfolio', () => {
    const { items } = derivePortfolio(input)

    const usdItem = items.find(item => item.walletId === 'w2')!
    expect(usdItem.remaining).toBe(93)
    expect(usdItem.remainingBase).toBe(9300)
    expect(usdItem.paidInterestBase).toBe(usdItem.paidInterest * 100)
    expect(usdItem.contractRate).toBe(20)
    expect(usdItem.nextPayment).not.toBeNull()

    const share = items.reduce((total, item) => total + item.interestShareOfPortfolio, 0)
    expect(share).toBeCloseTo(1, 10)
  })

  it('sorts by effective rate, closed loans last', () => {
    const closed = portfolioLoan({ walletId: 'w3' }, 'RUB', 0, 'Closed')
    closed.summary = { ...closed.summary, effectiveRate: 99, isClosed: true }
    const { items } = derivePortfolio({ ...input, loans: [closed, rub, usd] })

    expect(items.map(item => item.walletId)).toEqual(['w2', 'w1', 'w3'])
  })

  it('sorts a loan with nothing settled yet by its contract rate', () => {
    const fresh = portfolioLoan({ annualRate: 30, walletId: 'w5' }, 'RUB', -12_000, 'Fresh')
    fresh.summary = { ...fresh.summary, effectiveRate: 0 }
    const { items } = derivePortfolio({ ...input, loans: [rub, fresh] })

    expect(items[0]?.walletId).toBe('w5')
  })

  it('leaves a loan with no rate to project at out of the recommendation', () => {
    const unknown = portfolioLoan({ walletId: 'w6' }, 'RUB', -9300, 'No rate')
    unknown.summary = { ...unknown.summary, projectionRate: null }
    const { recommendation } = derivePortfolio({ ...input, loans: [unknown, usd] })

    expect(recommendation!.avalanche.walletId).toBe('w2')
    expect(recommendation!.snowball.walletId).toBe('w2')
  })

  it('merges the monthly interest of every loan after conversion', () => {
    const { interestByMonth } = derivePortfolio(input)

    expect(interestByMonth.map(item => item.month)).toEqual([day('2026-01-01'), day('2026-02-01'), day('2026-03-01')])
    expect(interestByMonth[0]!.interest).toBe(100 + 100 * 100)
    expect(interestByMonth.every(item => item.fine === 0)).toBe(true)
  })

  it('recommends the biggest saving and the smallest debt', () => {
    const small = portfolioLoan({ annualRate: 5, principalAmount: 6000, walletId: 'w4' }, 'RUB', -2000, 'Small')
    const { recommendation } = derivePortfolio({ ...input, loans: [rub, usd, small] })!

    expect(recommendation!.snowball.walletId).toBe('w4')
    expect(recommendation!.avalanche.interestSaved).toBeGreaterThan(0)
    expect(recommendation!.avalanche.newEndDate).not.toBeNull()
  })

  it('has nothing to recommend without extra money or open loans', () => {
    expect(derivePortfolio({ ...input, extra: 0 }).recommendation).toBeNull()

    const closed = portfolioLoan({ walletId: 'w3' }, 'RUB', 0, 'Closed')
    closed.summary = { ...closed.summary, isClosed: true }
    expect(derivePortfolio({ ...input, loans: [closed] }).recommendation).toBeNull()
  })
})
