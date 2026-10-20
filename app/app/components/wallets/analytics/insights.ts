/** An insight speaks only once the gap is at least this share. */
export const INSIGHT_MIN_GAP = 0.15
/** Interest is worth a note from this share of the expense. */
export const INSIGHT_INTEREST_SHARE = 0.05
/** At most this many notes. */
export const INSIGHT_COUNT = 3

export type Insight
  = | { id: 'expensePace', percent: number }
    | { id: 'interestShare', percent: number }
    | { from: number, id: 'savingsRate', to: number }

/** Short notes from the numbers, the largest gaps first. Rates and shares are fractions; percents come out whole. */
export function buildInsights(params: {
  /** Estimate for the current interval against the median of the full ones. */
  expenseEstimate?: number
  expenseMedian?: number
  expenseTotal: number
  interestTotal: number
  savingsRateNow?: number
  savingsRatePrevious?: number
}): Insight[] {
  const { expenseEstimate, expenseMedian, expenseTotal, interestTotal, savingsRateNow, savingsRatePrevious } = params
  const result: { insight: Insight, weight: number }[] = []
  if (expenseEstimate !== undefined && expenseMedian) {
    const gap = expenseEstimate / expenseMedian - 1
    if (Math.abs(gap) >= INSIGHT_MIN_GAP)
      result.push({ insight: { id: 'expensePace', percent: Math.round(gap * 100) }, weight: Math.abs(gap) })
  }
  if (expenseTotal > 0 && interestTotal / expenseTotal >= INSIGHT_INTEREST_SHARE)
    result.push({ insight: { id: 'interestShare', percent: Math.round(interestTotal / expenseTotal * 100) }, weight: interestTotal / expenseTotal })
  if (savingsRateNow !== undefined && savingsRatePrevious !== undefined && Math.abs(savingsRateNow - savingsRatePrevious) >= INSIGHT_MIN_GAP)
    result.push({ insight: { from: Math.round(savingsRatePrevious * 100), id: 'savingsRate', to: Math.round(savingsRateNow * 100) }, weight: Math.abs(savingsRateNow - savingsRatePrevious) })
  return result.sort((a, b) => b.weight - a.weight).slice(0, INSIGHT_COUNT).map(item => item.insight)
}
