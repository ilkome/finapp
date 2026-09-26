import type { CurrencyCode } from '~/components/currencies/types'
import type { LoanCost, LoanParams, LoanSummary } from '~/components/loans/engine/types'
import type { WalletId } from '~/components/wallets/types'

import { round2 } from '~/components/loans/engine/schedule'
import { whatIf } from '~/components/loans/engine/summary'

export type PortfolioLoan = {
  annualRate: number | null
  cost: LoanCost
  currency: CurrencyCode
  name: string
  params: LoanParams
  summary: LoanSummary
  walletId: WalletId
}

/** Every `*Base` field is the native one converted into the base currency. */
export type PortfolioItem = {
  contractRate: number | null
  currency: CurrencyCode
  effectiveRate: number
  /** Share of this loan in the portfolio's paid plus planned interest, 0..1. */
  interestShareOfPortfolio: number
  isClosed: boolean
  name: string
  nextPayment: { amount: number, amountBase: number, date: number } | null
  overdueCount: number
  paidInterest: number
  paidInterestBase: number
  plannedEndDate: number | null
  plannedInterest: number
  plannedInterestBase: number
  remaining: number
  remainingBase: number
  walletId: WalletId
}

export type PortfolioTotals = {
  paidFine: number
  paidInterest: number
  paidTotal: number
  plannedInterest: number
  remaining: number
}

export type PortfolioPick = {
  /** In the base currency, so the two strategies stay comparable. */
  interestSaved: number
  newEndDate: number | null
  walletId: WalletId
}

export type PortfolioRecommendation = {
  avalanche: PortfolioPick
  snowball: PortfolioPick
}

export type PortfolioInput = {
  /** Free money to throw at one loan, in the base currency. */
  extra: number
  fromBase: (amount: number, currency: CurrencyCode) => number
  loans: PortfolioLoan[]
  toBase: (amount: number, currency: CurrencyCode) => number
  today: number
}

export type Portfolio = {
  interestByMonth: { fine: number, interest: number, month: number }[]
  items: PortfolioItem[]
  recommendation: PortfolioRecommendation | null
  totals: PortfolioTotals
}

/**
 * Everything the loans page shows, in one pass: the portfolio in the base currency and where
 * an extra payment would buy the most. Loans keep their own currency, so every cross-loan
 * comparison happens after conversion.
 */
export function derivePortfolio(input: PortfolioInput): Portfolio {
  const { extra, fromBase, loans, toBase, today } = input

  const totals: PortfolioTotals = { paidFine: 0, paidInterest: 0, paidTotal: 0, plannedInterest: 0, remaining: 0 }
  const byMonth = new Map<number, { fine: number, interest: number }>()

  const items: PortfolioItem[] = loans.map(({ annualRate, cost, currency, name, summary, walletId }) => {
    const base = (amount: number) => round2(toBase(amount, currency))

    totals.paidFine += base(summary.paidFine)
    totals.paidInterest += base(summary.paidInterest)
    totals.paidTotal += base(summary.paidTotal)
    totals.plannedInterest += base(summary.plannedInterest)
    totals.remaining += base(summary.remaining)

    for (const month of cost.byMonth) {
      const bucket = byMonth.get(month.month) ?? { fine: 0, interest: 0 }
      bucket.fine += base(month.fine)
      bucket.interest += base(month.interest)
      byMonth.set(month.month, bucket)
    }

    return {
      contractRate: annualRate,
      currency,
      effectiveRate: summary.effectiveRate,
      interestShareOfPortfolio: 0,
      isClosed: summary.isClosed,
      name,
      nextPayment: summary.nextPayment
        ? { amount: summary.nextPayment.amount, amountBase: base(summary.nextPayment.amount), date: summary.nextPayment.date }
        : null,
      overdueCount: summary.overdueCount,
      paidInterest: summary.paidInterest,
      paidInterestBase: base(summary.paidInterest),
      plannedEndDate: summary.plannedEndDate,
      plannedInterest: summary.plannedInterest,
      plannedInterestBase: base(summary.plannedInterest),
      remaining: summary.remaining,
      remainingBase: base(summary.remaining),
      walletId,
    }
  })

  for (const key of Object.keys(totals) as (keyof PortfolioTotals)[])
    totals[key] = round2(totals[key])

  const interestTotal = totals.paidInterest + totals.plannedInterest
  if (interestTotal > 0) {
    for (const item of items)
      item.interestShareOfPortfolio = (item.paidInterestBase + item.plannedInterestBase) / interestTotal
  }

  // A loan with nothing settled yet has no effective rate: its contract rate stands in for it.
  const rateOf = (item: PortfolioItem) => item.effectiveRate || (item.contractRate ?? 0)
  items.sort((a, b) => Number(a.isClosed) - Number(b.isClosed) || rateOf(b) - rateOf(a))

  return {
    interestByMonth: [...byMonth.entries()]
      .map(([month, value]) => ({ fine: round2(value.fine), interest: round2(value.interest), month }))
      .sort((a, b) => a.month - b.month),
    items,
    recommendation: recommend(loans, extra, fromBase, toBase, today),
    totals,
  }
}

function recommend(
  loans: PortfolioLoan[],
  extra: number,
  fromBase: PortfolioInput['fromBase'],
  toBase: PortfolioInput['toBase'],
  today: number,
): PortfolioRecommendation | null {
  // Without a rate to project at, what-if would count the whole remaining interest as saved.
  const open = loans.filter(loan => !loan.summary.isClosed && loan.summary.projectionRate !== null)
  if (extra <= 0 || open.length === 0)
    return null

  const picks = open.map((loan) => {
    const result = whatIf(loan.params, loan.summary.rows, fromBase(extra, loan.currency), 'reduceTerm', today)
    return {
      pick: { interestSaved: round2(toBase(result.interestSaved, loan.currency)), newEndDate: result.newEndDate, walletId: loan.walletId },
      remainingBase: toBase(loan.summary.remaining, loan.currency),
    }
  })

  const avalanche = picks.reduce((best, item) => item.pick.interestSaved > best.pick.interestSaved ? item : best)
  const snowball = picks.reduce((best, item) => item.remainingBase < best.remainingBase ? item : best)

  return { avalanche: avalanche.pick, snowball: snowball.pick }
}
