import dayjs from 'dayjs'
import type { Period, Range } from '~/components/date/types'

export const periods = ['day', 'week', 'month', 'year'] as const

export function getIntervalDates(r: Range, period: Period) {
  const dates = []
  let current = dayjs(r.start).startOf(period)
  const end = dayjs(r.end).endOf(period)

  while (current.isBefore(end) || current.isSame(end)) {
    dates.push(dayjs(current).startOf(period).valueOf())
    current = current.add(1, period)
  }

  return dates
}
