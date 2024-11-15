import dayjs from 'dayjs'
import type { Range, RangePeriodDuration } from '~/components/date/types'

export function calculatePeriodRange(params: RangePeriodDuration): Range {
  return {
    end: dayjs(params.range.end)
      .endOf(params.period)
      .valueOf(),
    start: dayjs(params.range.end)
      .subtract(params.duration - 1, params.period)
      .startOf(params.period)
      .valueOf(),
  }
}

export function calculateRange(props: { duration: number, period: Period, rangeOffset: number }): Range {
  const baseDate = dayjs().subtract(props.rangeOffset * (props.duration === 0 ? 1 : props.duration), props.period)

  return {
    end: baseDate.endOf(props.period).valueOf(),
    start: baseDate
      .subtract(props.duration, props.period)
      .startOf(props.period)
      .valueOf(),
  }
}

export function getPeriodsInRange(params: RangePeriodDuration) {
  const list: Range[] = []
  let current = calculatePeriodRange({
    duration: params.duration,
    period: params.period,
    range: params.range,
  })

  while (current.end > params.range.start) {
    list.unshift(current)

    current = {
      end: dayjs(current.end).subtract(params.duration, params.period).endOf(params.period).valueOf(),
      start: dayjs(current.start).subtract(params.duration, params.period).startOf(params.period).valueOf(),
    }
  }

  return list
}
