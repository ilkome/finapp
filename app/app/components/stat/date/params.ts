import type { Period, Range } from '~~/utils/date/types'

import { differenceInDays, sub } from 'date-fns'
import { z } from 'zod/v4'
import { u } from '~~/utils/date/civil'
import { getEndOf, getStartOf, toDuration } from '~~/utils/date/period'
import { periods } from '~~/utils/date/types'

import type { IntervalsInRangeProps, StatDateParams, StatDateParamsQuery } from '~/components/stat/date/types'

export function calculateIntervalInRange(params: IntervalsInRangeProps): Range {
  const offset = (params.rangeOffset ?? 0) * params.intervalsDuration
  const baseDate = sub(u(params.range.end), toDuration(params.intervalsBy, offset))

  return {
    end: getEndOf(baseDate, params.intervalsBy).getTime(),
    start: getStartOf(
      sub(baseDate, toDuration(params.intervalsBy, params.intervalsDuration - 1)),
      params.intervalsBy,
    ).getTime(),
  }
}

export function calculateBestIntervalsBy(range: Range): Period {
  const rangeDuration = differenceInDays(range.end, range.start)
  return rangeDuration > 400
    ? 'year'
    : rangeDuration > 80
      ? 'month'
      : 'day'
}

export function getIntervalsInRange(params: IntervalsInRangeProps) {
  const list: Range[] = []
  const { range } = params

  let current = calculateIntervalInRange({ ...params, rangeOffset: 0 })

  while (current.end > range.start) {
    list.push(current)
    current = calculateIntervalInRange({ ...params, range: current, rangeOffset: 1 })
  }

  list.reverse()

  if (list.length > 0) {
    if (list.at(-1)!.end > range.end)
      list.at(-1)!.end = getEndOf(u(range.end), 'day').getTime()

    if (list.at(0)!.start < range.start)
      list.at(0)!.start = getStartOf(u(range.start), 'day').getTime()
  }

  return list
}

const queryParamsSchema = z.object({
  intervalsBy: z.enum(periods).optional(),
  intervalsDuration: z.string().transform(val => Number(val)).pipe(z.number().int()).optional(),
  intervalSelected: z.string().transform(val => Number(val)).pipe(z.number().int()).optional(),
  isShowMaxRange: z.string().transform(val => val === 'true').optional(),
  isSkipEmpty: z.string().transform(val => val === 'true').optional(),
  rangeBy: z.enum(periods).optional(),
  rangeDuration: z.string().transform(val => Number(val)).pipe(z.number().int()).optional(),
  rangeOffset: z.string().transform(val => Number(val)).pipe(z.number().int()).optional(),
})

export const defaultStatDateParams: StatDateParams = {
  customDate: false,
  intervalsBy: 'day',
  intervalsDuration: 1,
  intervalSelected: -1,
  isShowMaxRange: false,
  isSkipEmpty: false,
  rangeBy: 'day',
  rangeDuration: 14,
  rangeOffset: 0,
}

/**
 * Parse URL query params via Zod and merge into stat date params.
 * Returns a new params object (does not mutate input).
 */
export function parseStatDateQueryParams(
  queryParams: Partial<StatDateParamsQuery>,
  currentParams: StatDateParams,
): StatDateParams {
  const parsed = queryParamsSchema.safeParse(queryParams)
  if (!parsed.success)
    return currentParams

  const data = parsed.data
  const result = { ...currentParams }

  if (data.intervalsBy !== undefined)
    result.intervalsBy = data.intervalsBy
  if (data.intervalsDuration !== undefined)
    result.intervalsDuration = data.intervalsDuration
  if (data.intervalSelected !== undefined)
    result.intervalSelected = data.intervalSelected
  if (data.rangeBy !== undefined)
    result.rangeBy = data.rangeBy
  if (data.rangeDuration !== undefined)
    result.rangeDuration = data.rangeDuration
  if (data.rangeOffset !== undefined)
    result.rangeOffset = data.rangeOffset
  if (data.isShowMaxRange !== undefined)
    result.isShowMaxRange = data.isShowMaxRange
  if (data.isSkipEmpty !== undefined)
    result.isSkipEmpty = data.isSkipEmpty

  return result
}

/**
 * Compute the active date range from params and max range.
 * Priority: customDate > isShowMaxRange+isSkipEmpty > isShowMaxRange > calculated.
 */
export function computeDateRange(
  params: StatDateParams,
  maxRange: Range,
  now: number,
): Range {
  if (params.customDate) {
    return params.customDate
  }

  if (params.isShowMaxRange) {
    return params.isSkipEmpty
      ? { ...maxRange }
      : { end: getEndOf(new Date(now), params.rangeBy).getTime(), start: maxRange.start }
  }

  return calculateIntervalInRange({
    intervalsBy: params.rangeBy,
    intervalsDuration: params.rangeDuration,
    range: {
      end: now,
      start: now,
    },
    rangeOffset: params.rangeOffset,
  })
}
