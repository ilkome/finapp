import { z } from 'zod/v4'

import type { Range, StatDateParams, StatDateParamsQuery } from '~/components/date/types'

import { periods } from '~/components/date/types'
import { calculateIntervalInRange, getEndOf } from '~/components/date/utils'

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
