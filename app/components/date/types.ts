import type { useStatDate } from '~/components/date/useStatDate'

export const periods = ['day', 'week', 'month', 'year'] as const
export type Period = typeof periods[number]

export type DateUTC = number

export type Range = {
  end: DateUTC
  start: DateUTC
}

export type StatDateParams = {
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

export type StatDateParamsQuery = {
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

export type IntervalsInRangeProps = Pick<StatDateParams, 'intervalsBy' | 'intervalsDuration'> & {
  range: Range
}

export type CalculateRangeParams = Pick<StatDateParams, 'rangeDuration' | 'rangeBy' | 'rangeOffset'>

export type Interval = Pick<StatDateParams, 'rangeDuration' | 'rangeBy'>
export type Grouped = Pick<StatDateParams, 'intervalsBy' | 'intervalsDuration'>

export type IntervalGroupedLabel = Grouped & Interval & {
  isShowMaxRange?: boolean
  isSkipEmpty?: boolean
  label?: string
}

export type StatDateProvider = ReturnType<typeof useStatDate>
