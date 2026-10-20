import type { Period, Range } from '~~/utils/date/types'

import { u } from '~~/utils/date/civil'
import { getEndOf } from '~~/utils/date/period'

import { typicalAmount } from '~/components/wallets/analytics/regular'

/** Full intervals the current one is compared with by pace; fewer fall back to scaling by days. */
export const PACE_WINDOW = 3

export const median = (values: number[]) => typicalAmount(values, 'median')

/** The last interval is cut by today when its natural end is still ahead. */
export function isLastIntervalPartial(intervals: Range[], period: Period): boolean {
  const last = intervals.at(-1)
  return !!last && getEndOf(u(last.start), period).getTime() > last.end
}

/** Average, median, best and worst over full intervals only; the indexes point into `values`. */
export function intervalStats(values: number[], fullCount: number) {
  const full = values.slice(0, fullCount)
  if (!full.length)
    return null
  let bestIndex = 0
  let worstIndex = 0
  full.forEach((value, index) => {
    if (value > full[bestIndex]!)
      bestIndex = index
    if (value < full[worstIndex]!)
      worstIndex = index
  })
  return {
    average: Math.round(full.reduce((sum, value) => sum + value, 0) / full.length),
    bestIndex,
    median: median(full),
    worstIndex,
  }
}

/**
 * The current interval against past ones at the same elapsed day. Spending is lumpy (rent on the 1st), so
 * the expected amount is the median of what past intervals had by this day, and the estimate adds the median of
 * what they still spent after it. Too little history scales the actual amount by the elapsed share instead.
 */
export function paceOf(params: {
  actual: number
  /** Share of the current interval already gone, (0, 1]. */
  elapsedShare: number
  /** Per past full interval: the amount by the same elapsed day, and its total. */
  past: { byNow: number, total: number }[]
}): { estimate: number, expectedByNow?: number } {
  const { actual, elapsedShare, past } = params
  if (past.length < PACE_WINDOW)
    return { estimate: Math.round(actual / Math.max(elapsedShare, Number.EPSILON)) }
  const window = past.slice(-PACE_WINDOW)
  return {
    estimate: actual + median(window.map(item => item.total - item.byNow)),
    expectedByNow: median(window.map(item => item.byNow)),
  }
}

/** Intervals the savings-rate trend averages over. */
export const ROLLING_WINDOW = 3
/** The savings-rate chart is clamped to ±this share: a small income makes the rate explode. */
export const SAVINGS_RATE_CLAMP = 1
/** Expense this many times the median is an anomaly. */
export const ANOMALY_FACTOR = 1.5

/** Rolling mean over the last `window` values; null until a value exists in the window. */
export function rollingMean(values: (number | null)[], window = ROLLING_WINDOW): (number | null)[] {
  return values.map((_, index) => {
    const slice = values.slice(Math.max(0, index - window + 1), index + 1).filter((value): value is number => value !== null)
    return slice.length ? slice.reduce((sum, value) => sum + value, 0) / slice.length : null
  })
}

/** Savings rate per interval (null without income) and its rolling mean, clamped for drawing. */
export function savingsRateTrend(income: number[], net: number[]) {
  const clamp = (value: number | null) => value === null ? null : Math.max(-SAVINGS_RATE_CLAMP, Math.min(SAVINGS_RATE_CLAMP, value))
  const rates = income.map((value, index) => value > 0 ? net[index]! / value : null)
  return { rates: rates.map(clamp), rolling: rollingMean(rates).map(clamp) }
}

/** Full intervals whose expense exceeds the median of the full ones by `ANOMALY_FACTOR`. */
export function expenseAnomalies(expense: number[], fullCount: number): number[] {
  const full = expense.slice(0, fullCount)
  const threshold = median(full) * ANOMALY_FACTOR
  return threshold > 0 ? full.flatMap((value, index) => value > threshold ? [index] : []) : []
}

/** How regular income is over the full intervals: the share with any, and its spread. */
export function incomeStability(income: number[], fullCount: number) {
  const full = income.slice(0, fullCount)
  if (!full.length)
    return null
  return { max: Math.max(...full), median: median(full), min: Math.min(...full), share: full.filter(value => value > 0).length / full.length }
}
