import { roundTo } from '~~/utils/amount/round'

import type { CurrencyCode } from '~/components/currencies/types'
import type { LoanCost, LoanParams, LoanSummary } from '~/components/loans/engine/types'
import type { WalletId } from '~/components/wallets/types'

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
type PortfolioItem = {
  closedDate: number | null
  contractRate: number | null
  currency: CurrencyCode
  effectiveRate: number
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
  startDate: number
  walletId: WalletId
}

type PortfolioTotals = {
  paidFine: number
  paidInterest: number
  paidTotal: number
  plannedInterest: number
  remaining: number
}

type PortfolioPick = {
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
  /** Decimal places of the base currency; 2 when omitted. */
  basePrecision?: number
  fromBase: (amount: number, currency: CurrencyCode) => number
  loans: PortfolioLoan[]
  toBase: (amount: number, currency: CurrencyCode) => number
}

export type Portfolio = {
  interestByMonth: { fine: number, interest: number, month: number }[]
  items: PortfolioItem[]
  totals: PortfolioTotals
}

/**
 * The portfolio in the base currency, in one pass. Loans keep their own currency, so every
 * cross-loan comparison happens after conversion.
 */
export function derivePortfolio(input: PortfolioInput): Portfolio {
  const { loans, toBase } = input
  const roundBase = (amount: number) => roundTo(amount, input.basePrecision ?? 2)

  const totals: PortfolioTotals = { paidFine: 0, paidInterest: 0, paidTotal: 0, plannedInterest: 0, remaining: 0 }
  const byMonth = new Map<number, { fine: number, interest: number }>()

  const items: PortfolioItem[] = loans.map(({ annualRate, cost, currency, name, params, summary, walletId }) => {
    const base = (amount: number) => roundBase(toBase(amount, currency))

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
      closedDate: summary.closedDate,
      contractRate: annualRate,
      currency,
      effectiveRate: summary.effectiveRate,
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
      startDate: params.startDate,
      walletId,
    }
  })

  for (const key of Object.keys(totals) as (keyof PortfolioTotals)[])
    totals[key] = roundBase(totals[key])

  // A loan with nothing settled yet has no effective rate: its contract rate stands in for it.
  const rateOf = (item: PortfolioItem) => item.effectiveRate || (item.contractRate ?? 0)
  items.sort((a, b) => Number(a.isClosed) - Number(b.isClosed) || rateOf(b) - rateOf(a))

  return {
    interestByMonth: [...byMonth.entries()]
      .map(([month, value]) => ({ fine: roundBase(value.fine), interest: roundBase(value.interest), month }))
      .sort((a, b) => a.month - b.month),
    items,
    totals,
  }
}

/** Where `extra` (free money in the base currency) would buy the most; separate so typing it skips the portfolio. */
export function recommend(input: PortfolioInput, extra: number): PortfolioRecommendation | null {
  const { fromBase, loans, toBase } = input
  const roundBase = (amount: number) => roundTo(amount, input.basePrecision ?? 2)
  // Without a rate to project at, what-if would count the whole remaining interest as saved.
  const open = loans.filter(loan => !loan.summary.isClosed && loan.summary.projectionRate !== null)
  if (extra <= 0 || open.length === 0)
    return null

  const picks = open.map((loan) => {
    const result = whatIf(loan.params, loan.summary.rows, fromBase(extra, loan.currency), 'reduceTerm')
    return {
      pick: { interestSaved: roundBase(toBase(result.interestSaved, loan.currency)), newEndDate: result.newEndDate, walletId: loan.walletId },
      remainingBase: toBase(loan.summary.remaining, loan.currency),
    }
  })

  const avalanche = picks.reduce((best, item) => item.pick.interestSaved > best.pick.interestSaved ? item : best)
  const snowball = picks.reduce((best, item) => item.remainingBase < best.remainingBase ? item : best)

  return { avalanche: avalanche.pick, snowball: snowball.pick }
}
