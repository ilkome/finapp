import type { Period, Range } from '~~/utils/date/types'

import type { useStatDate } from '~/components/stat/date/useStatDate'

export type StatDateParams = {
  customDate: false | Range
  granularityBy: Period
  granularityDuration: number
  intervalSelected: number
  isShowMaxRange: boolean
  isSkipEmpty: boolean
  rangeBy: Period
  rangeDuration: number
  rangeOffset: number
}

export type StatDateParamsQuery = {
  customDate: string
  granularityBy: Period
  granularityDuration: string
  intervalSelected: string
  isShowMaxRange: string
  isSkipEmpty: string
  rangeBy: Period
  rangeDuration: string
  rangeOffset: string
}

export type IntervalsInRangeProps = Pick<StatDateParams, 'granularityBy' | 'granularityDuration'> & {
  range: Range
  rangeOffset?: number
}

type Interval = Pick<StatDateParams, 'rangeDuration' | 'rangeBy'>
export type Grouped = Pick<StatDateParams, 'granularityBy' | 'granularityDuration'>

export type IntervalGroupedLabel = Grouped & Interval & {
  isShowMaxRange?: boolean
  isSkipEmpty?: boolean
  label?: string
}

export type StatDateProvider = ReturnType<typeof useStatDate>
