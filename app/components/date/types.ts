import type { useIntervalRange } from '~/components/date/useIntervalRange'

export const periods = ['day', 'week', 'month', 'year'] as const

export type DateUTC = number

export type Range = {
  end: DateUTC
  start: DateUTC
}

export type GroupBy = 'period' | 'all' | 'daySelector'

export type Period = typeof periods[number]

export type RangeDuration = {
  duration: number
  groupBy: 'period' | 'all' | 'daySelector'
  label?: string
  period: Period
  range?: Range
}

export type RangePeriodDuration = {
  duration: number
  period: Period
  range: Range
}

export type Interval = {
  duration: number
  period: Period
}

export type FullDuration = {
  grouped: Interval
  interval: Interval
  label?: string
}

export type IntervalRangeProvider = ReturnType<typeof useIntervalRange>
