import type { Range } from '~~/utils/date/types'

import { sub } from 'date-fns'
import { getEndOf, getStartOf, toDuration } from '~~/utils/date/period'

import type { StatDateParams } from '~/components/stat/date/types'

function isDayToday(params: StatDateParams, range: Range, now: Date): boolean {
  return params.rangeBy === 'day' && params.rangeDuration === 1 && range.end < getEndOf(now, 'day').getTime()
}

export function isShowNav(params: StatDateParams, range: Range, maxRange: Range, now: Date): boolean {
  return !params.isShowMaxRange
    && (range.start < now.getTime()
      || (range.start !== maxRange.start && range.end !== maxRange.end))
}

export function isEnd(params: StatDateParams, range: Range, now: Date): boolean {
  return range.end >= getEndOf(now, params.rangeBy).getTime() && !isDayToday(params, range, now)
}

export function isStart(range: Range, maxRange: Range): boolean {
  return range.start <= maxRange.start
}

export function isShowNavHome(params: StatDateParams, range: Range, now: Date): boolean {
  const start = getStartOf(sub(now, toDuration(params.rangeBy, params.rangeDuration - 1)), params.rangeBy).getTime()
  const end = getEndOf(now, params.rangeBy).getTime()

  return !params.isShowMaxRange && (params.intervalSelected !== -1 || (range.start !== start && range.end !== end))
}
