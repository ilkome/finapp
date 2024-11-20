import dayjs from 'dayjs'
import type { IntervalsInRangeProps, Range } from '~/components/date/types'

export function calculateIntervalInRange(params: IntervalsInRangeProps): Range {
  const baseDate = dayjs(params.range.end).subtract(params.rangeOffset ?? 0 * params.intervalsDuration, params.intervalsBy)

  return {
    end: baseDate
      .endOf(params.intervalsBy)
      .valueOf(),
    start: baseDate
      .subtract(params.intervalsDuration - 1, params.intervalsBy)
      .startOf(params.intervalsBy)
      .valueOf(),
  }
}

export function calculateBestIntervalsBy(range: Range) {
  const rangeDuration = dayjs(range.end).diff(range.start, 'day')
  return rangeDuration > 400
    ? 'year'
    : rangeDuration > 80
      ? 'month'
      : 'day'
}

export function getIntervalsInRange(params: IntervalsInRangeProps) {
  const list: Range[] = []
  const { intervalsBy, intervalsDuration, range } = params

  let current = calculateIntervalInRange({
    intervalsBy,
    intervalsDuration,
    range,
    rangeOffset: 0,
  })

  while (current.end > range.start) {
    list.unshift(current)

    current = {
      end: dayjs(current.end)
        .subtract(intervalsDuration, intervalsBy)
        .endOf(intervalsBy)
        .valueOf(),
      start: dayjs(current.start)
        .subtract(intervalsDuration, intervalsBy)
        .startOf(intervalsBy)
        .valueOf(),
    }
  }

  if (list.length > 0) {
    if (list.at(-1)!.end > range.end) {
      list.at(-1)!.end = dayjs(range.end).endOf('day').valueOf()
    }

    if (list.at(0)!.start < range.start) {
      list.at(0)!.start = dayjs(range.start).startOf('day').valueOf()
    }
  }

  return list
}
