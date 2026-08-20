import type { ComputedRef, MaybeRefOrGetter, Ref } from 'vue'
import type { Period, Range } from '~~/utils/date/types'

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
  rangePanOffset: number
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
  rangePanOffset: string
}

export type StatRangePanDirection = 'future' | 'past'

export type UseStatDateOptions = {
  initParams?: Partial<StatDateParams>
  key: MaybeRefOrGetter<string>
  legacyKey?: MaybeRefOrGetter<string | undefined>
  maxRange: ComputedRef<Range>
  overrideStoredWithInitParams?: boolean
  queryParams?: Partial<StatDateParamsQuery>
  storage?: Storage
}

export type IntervalsInRangeProps = Pick<StatDateParams, 'granularityBy' | 'granularityDuration'> & {
  range: Range
  rangeOffset?: number
}

type Interval = Pick<StatDateParams, 'rangeDuration' | 'rangeBy'>
export type Grouped = Pick<StatDateParams, 'granularityBy' | 'granularityDuration'>

export type IntervalGroupedLabel = Grouped
  & Interval & {
    isShowMaxRange?: boolean
    isSkipEmpty?: boolean
    label?: string
  }

export type StatDateProvider = {
  canPanRange: (direction: StatRangePanDirection) => boolean
  clearScrollRangeOffset: () => void
  effectiveParams: ComputedRef<StatDateParams>
  goHome: () => void
  intervalsInRange: ComputedRef<Range[]>
  isScrollRangeOverridden: ComputedRef<boolean>
  maxRange: ComputedRef<Range>
  minusGranularity: () => void
  minusRange: () => void
  modal: Ref<{ dateSelector: boolean }>
  panRange: (direction: StatRangePanDirection) => boolean
  params: Ref<StatDateParams>
  plusGranularity: () => void
  plusRange: () => void
  range: ComputedRef<Range>
  resetRangePan: () => void
  resetScrollRange: () => void
  scrollRangeOffset: Ref<number | null>
  scrollRangeResetVersion: Ref<number>
  selectedInterval: ComputedRef<Range | undefined>
  selectInterval: (index: number) => number | undefined
  setGranularity: (grouped: Grouped) => void
  setGranularityBy: (granularityBy: Grouped['granularityBy']) => void
  setMaxRange: (isSkipEmpty?: boolean) => void
  setRangeByCalendar: (range: Range) => void
  setRangeByPeriod: (interval: IntervalGroupedLabel) => void
  setRangePanOffset: (offset: number) => boolean
  setScrollRangeOffset: (offset: number) => void
  stepInterval: (direction: 1 | -1) => void
  stepRange: (direction: 1 | -1) => void
}
