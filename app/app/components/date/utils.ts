import { differenceInDays, sub } from 'date-fns'

import type { IntervalsInRangeProps } from '~/components/date/types'
import type { Period, Range } from '~~/utils/date/types'

import { u } from '~~/utils/date/civil'
import { getEndOf, getStartOf, toDuration } from '~~/utils/date/period'

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
