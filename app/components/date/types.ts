import type { useStatDate } from '~/components/date/useStatDate'

export const periods = ['day', 'week', 'month', 'year'] as const
export type Period = typeof periods[number]

export type DateUTC = number

export type Range = {
  end: DateUTC
  start: DateUTC
}

export type statDateParams = {
  customDate: false | Range
  intervalsBy: Period
  intervalsDuration: number
  intervalSelected: number
  isShowMaxRange: boolean
  isSkipEmpty: boolean
  rangeBy: Period
  rangeDuration: number
  rangeOffset: number
}

export type statDateParamsQuery = {
  customDate: string
  intervalsBy: Period
  intervalsDuration: string
  intervalSelected: string
  isShowMaxRange: string
  isSkipEmpty: string
  rangeBy: Period
  rangeDuration: string
  rangeOffset: string
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

export type Interval = Pick<statDateParams, 'rangeDuration' | 'rangeBy'>
export type Grouped = Pick<statDateParams, 'intervalsBy' | 'intervalsDuration'>

export type IntervalGroupedLabel = Grouped & Interval & {
  isShowMaxRange?: boolean
  isSkipEmpty?: boolean
  label?: string
}

export type StatDateProvider = ReturnType<typeof useStatDate>
