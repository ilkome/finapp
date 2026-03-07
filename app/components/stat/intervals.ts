import { differenceInDays, differenceInMonths, differenceInWeeks } from 'date-fns'

import type { TotalReturns } from '~/components/amount/getTotal'
import type { Range, StatDateParams } from '~/components/date/types'
import type { IntervalData } from '~/components/stat/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

/**
 * Bucket transaction IDs into date intervals using binary search.
 * Single pass over trns — O(N log M) where M = number of intervals.
 */
export function bucketTrnsByIntervals(
  trnsItems: Record<TrnId, TrnItem>,
  trnsIds: TrnId[],
  intervalsInRange: Range[],
  computeTotal: (ids: TrnId[]) => TotalReturns,
): IntervalData[] {
  if (!intervalsInRange.length)
    return []

  const buckets: TrnId[][] = intervalsInRange.map(() => [])

  for (const id of trnsIds) {
    const trnDate = trnsItems[id]?.date
    if (trnDate == null)
      continue

    let lo = 0
    let hi = intervalsInRange.length - 1
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (trnDate < intervalsInRange[mid].start) {
        hi = mid - 1
      }
      else if (trnDate > intervalsInRange[mid].end) {
        lo = mid + 1
      }
      else {
        buckets[mid].push(id)
        break
      }
    }
  }

  return intervalsInRange.map((range, i) => ({
    range,
    total: computeTotal(buckets[i]),
    trnsIds: buckets[i],
  }))
}

/**
 * Compute averages (per day/week/month) for a date range.
 * Returns only non-zero entries.
 */
export function computeAverageTotal(
  sum: number,
  dateRange: Range,
): Record<string, number> | undefined {
  if (differenceInDays(dateRange.end, dateRange.start) < 2)
    return undefined

  const dif = {
    day: differenceInDays(dateRange.end, dateRange.start) + 1,
    month: differenceInMonths(dateRange.end, dateRange.start) + 1,
    week: differenceInWeeks(dateRange.end, dateRange.start) + 1,
  }

  const items: Record<string, number> = {}

  if (dif.month > 1 && sum !== 0)
    items.month = sum / dif.month
  if (dif.week > 1 && sum !== 0)
    items.week = sum / dif.week
  if (dif.day > 1 && sum !== 0)
    items.day = sum / dif.day

  return Object.keys(items).length > 0 ? items : undefined
}

/**
 * Check if the current period represents a single day.
 */
export function isPeriodOneDay(params: Pick<StatDateParams, 'intervalsBy' | 'intervalSelected' | 'rangeBy' | 'rangeDuration'>): boolean {
  return (params.rangeBy === 'day' && params.rangeDuration === 1)
    || (params.intervalsBy === 'day' && params.intervalSelected !== -1)
}
