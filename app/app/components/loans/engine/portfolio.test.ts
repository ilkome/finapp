import { describe, expect, it } from 'vitest'

import type { PortfolioLoan } from '~/components/loans/engine/portfolio'
import type { LoanItem } from '~/components/loans/types'

import { deriveLoan, paramsOf } from '~/components/loans/engine/derive'
import { costOf } from '~/components/loans/engine/ledger'
import { derivePortfolio, recommend } from '~/components/loans/engine/portfolio'

const day = (iso: string) => Date.parse(`${iso}T00:00:00.000Z`)
const today = day('2026-04-01')

function loanItem(over: Partial<LoanItem>): LoanItem {
  return {
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
    walletId: 'w1',
    ...over,
  }
}

/** A loan with three paid months, built through the real engine so `rows` drive `whatIf`. */
function portfolioLoan(over: Partial<LoanItem>, currency: string, balance: number, name: string): PortfolioLoan {
  const loan = loanItem(over)
  const trns = [1, 2, 3].map(n => ({
    amount: 10_000,
    date: day(`2026-0${n}-15`),
    id: `i${n}${loan.walletId}`,
    kind: 'interest' as const,
  }))
  const principal = [1, 2, 3].map(n => ({
    amount: 100_000,
    date: day(`2026-0${n}-15`),
    id: `p${n}${loan.walletId}`,
    kind: 'payment' as const,
  }))

  return {
    annualRate: loan.annualRatePercent,
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

const rub = portfolioLoan({ walletId: 'w1' }, 'RUB', -930_000, 'Rub loan')
const usd = portfolioLoan({ annualRatePercent: 20, walletId: 'w2' }, 'USD', -9300, 'Usd loan')

const input = { fromBase, loans: [rub, usd], toBase }

describe('derivePortfolio', () => {
  it('totals every loan in the base currency', () => {
    const { totals } = derivePortfolio(input)

    expect(totals.remaining).toBe(rub.summary.remaining + usd.summary.remaining * 100)
    expect(totals.paidInterest).toBe(rub.summary.paidInterest + usd.summary.paidInterest * 100)
    expect(totals.paidTotal).toBe(rub.summary.paidTotal + usd.summary.paidTotal * 100)
    expect(totals.plannedInterest).toBe(rub.summary.plannedInterest + usd.summary.plannedInterest * 100)
    expect(totals.paidFine).toBe(0)
  })

  it('keeps native and base amounts side by side', () => {
    const { items } = derivePortfolio(input)

    const usdItem = items.find(item => item.walletId === 'w2')!
    expect(usdItem.remaining).toBe(9300)
    expect(usdItem.remainingBase).toBe(930_000)
    expect(usdItem.paidInterestBase).toBe(usdItem.paidInterest * 100)
    expect(usdItem.contractRate).toBe(20)
    expect(usdItem.nextPayment).not.toBeNull()
  })

  it('sorts by effective rate, closed loans last', () => {
    const closed = portfolioLoan({ walletId: 'w3' }, 'RUB', 0, 'Closed')
    closed.summary = { ...closed.summary, effectiveRate: 99, isClosed: true }
    const { items } = derivePortfolio({ ...input, loans: [closed, rub, usd] })

    expect(items.map(item => item.walletId)).toEqual(['w2', 'w1', 'w3'])
  })

  it('sorts a loan with nothing settled yet by its contract rate', () => {
    const fresh = portfolioLoan({ annualRatePercent: 30, walletId: 'w5' }, 'RUB', -1_200_000, 'Fresh')
    fresh.summary = { ...fresh.summary, effectiveRate: 0 }
    const { items } = derivePortfolio({ ...input, loans: [rub, fresh] })

    expect(items[0]?.walletId).toBe('w5')
  })

  it('leaves a loan with no rate to project at out of the recommendation', () => {
    const unknown = portfolioLoan({ walletId: 'w6' }, 'RUB', -930_000, 'No rate')
    unknown.summary = { ...unknown.summary, projectionRate: null }
    const recommendation = recommend({ ...input, loans: [unknown, usd] }, 100_000)

    expect(recommendation!.avalanche.walletId).toBe('w2')
    expect(recommendation!.snowball.walletId).toBe('w2')
  })

  it('merges the monthly interest of every loan after conversion', () => {
    const { interestByMonth } = derivePortfolio(input)

    expect(interestByMonth.map(item => item.month)).toEqual([day('2026-01-01'), day('2026-02-01'), day('2026-03-01')])
    expect(interestByMonth[0]!.interest).toBe(10_000 + 10_000 * 100)
    expect(interestByMonth.every(item => item.fine === 0)).toBe(true)
  })

  it('recommends the biggest saving and the smallest debt', () => {
    const small = portfolioLoan({ annualRatePercent: 5, principalAmount: 600_000, walletId: 'w4' }, 'RUB', -200_000, 'Small')
    const recommendation = recommend({ ...input, loans: [rub, usd, small] }, 100_000)

    expect(recommendation!.snowball.walletId).toBe('w4')
    expect(recommendation!.avalanche.interestSaved).toBeGreaterThan(0)
    expect(recommendation!.avalanche.newEndDate).not.toBeNull()
  })

  it('closes right away when the extra covers the whole debt', () => {
    const small = portfolioLoan({ annualRatePercent: 5, principalAmount: 600_000, walletId: 'w4' }, 'RUB', -200_000, 'Small')
    const recommendation = recommend({ ...input, loans: [small] }, 100_000_000)

    expect(recommendation!.snowball.newEndDate).toBeNull()
  })

  it('has nothing to recommend without extra money or open loans', () => {
    expect(recommend(input, 0)).toBeNull()

    const closed = portfolioLoan({ walletId: 'w3' }, 'RUB', 0, 'Closed')
    closed.summary = { ...closed.summary, isClosed: true }
    expect(recommend({ ...input, loans: [closed] }, 100_000)).toBeNull()
  })
})
