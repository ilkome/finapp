import type { useIntervalRange } from '~/components/date/useIntervalRange'

export const periods = ['day', 'week', 'month', 'year'] as const
export type Period = typeof periods[number]

export type DateUTC = number

export type Range = {
  end: DateUTC
  start: DateUTC
}

export type IntervalRangeParams = {
  customDate: false | Range
  groupedBy: Period
  groupedDuration: number
  intervalDuration: number
  intervalPeriod: Period
  intervalSelected: number
  isShowAll: boolean
  isSkipEmpty: boolean
  subtracted: number
}

export type IntervalRangeParamsQuery = {
  customDate: string
  groupedBy: Period
  groupedDuration: string
  intervalDuration: string
  intervalPeriod: Period
  intervalSelected: string
  isShowAll: string
  isSkipEmpty: string
  subtracted: string
}

export type GroupBy = 'period' | 'all' | 'daySelector'

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

export type Interval = Pick<IntervalRangeParams, 'intervalDuration' | 'intervalPeriod'>
export type Grouped = Pick<IntervalRangeParams, 'groupedBy' | 'groupedDuration'>

export type IntervalGroupedLabel = Grouped & Interval & {
  label?: string
}

export type IntervalRangeProvider = ReturnType<typeof useIntervalRange>
