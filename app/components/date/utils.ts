import dayjs from 'dayjs'
import type { CalculateRangeParams, IntervalsInRangeProps, Range } from '~/components/date/types'

export function calculateIntervalInRange(params: IntervalsInRangeProps): Range {
  return {
    end: dayjs(params.range.end)
      .endOf(params.intervalsBy)
      .valueOf(),
    start: dayjs(params.range.end)
      .subtract(params.intervalsDuration - 1, params.intervalsBy)
      .startOf(params.intervalsBy)
      .valueOf(),
  }
}

export function calculateRangeByToday(params: CalculateRangeParams): Range {
  const baseDate = dayjs().subtract(params.rangeOffset * params.rangeDuration, params.rangeBy)

  return {
    end: baseDate.endOf(params.rangeBy).valueOf(),
    start: baseDate
      .subtract(params.rangeDuration - 1, params.rangeBy)
      .startOf(params.rangeBy)
      .valueOf(),
  }
}

export function getIntervalsInRange(params: IntervalsInRangeProps) {
  const list: Range[] = []
  const { intervalsBy, intervalsDuration, range } = params

  let current = calculateIntervalInRange({
    intervalsBy,
    intervalsDuration,
    range,
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
