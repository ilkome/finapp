import dayjs from 'dayjs'
import { useStorage } from '@vueuse/core'
import type { FullDuration, Interval, Period, Range, RangePeriodDuration } from '~/components/date/types'
import { getPeriodsInRange } from '~/components/date/utils'

type IntervalRangeParams = {
  customDate: false | Range
  groupedBy: Period
  groupedDuration: number
  intervalDuration: number
  intervalPeriod: Period
  isShowAll: boolean
  isSkipEmpty: boolean
  selectedInterval: number
  subtracted: number
}

export function useIntervalRange({ key, maxRange }: { key: string, maxRange: ComputedRef<Range> }) {
  const params = useStorage<IntervalRangeParams>(`${key}-params`, {
    customDate: false,
    groupedBy: 'month',
    groupedDuration: 1,
    intervalDuration: 12,
    intervalPeriod: 'month',
    isShowAll: false,
    isSkipEmpty: false,
    selectedInterval: -1,
    subtracted: 0,
  })

  const grouped = useStorage<Interval>(`${key}-grouped`, {
    duration: 1,
    period: 'month',
  })

  const interval = useStorage<Interval & { selected: number }>(`${key}-interval`, {
    duration: 12,
    period: 'month',
    selected: -1,
  })

  const subtracted = ref(0)

  const viewConfig = useStorage(`${key}-viewConfig`, {
    isShowAll: false,
    isSkipEmpty: false,
  })

  // Extract range calculation logic
  function calculateRange(params: { duration: number, period: Period, subtracted: number }): Range {
    const baseDate = dayjs().subtract(params.subtracted * (params.duration === 0 ? 1 : params.duration), params.period)

    return {
      end: baseDate.endOf(params.period).valueOf(),
      start: baseDate
        .subtract(params.duration, params.period)
        .startOf(params.period)
        .valueOf(),
    }
  }

  const range = computed<Range>(() => {
    if (params.value.customDate) {
      return params.value.customDate
    }

    else if (viewConfig.value.isShowAll && viewConfig.value.isSkipEmpty) {
      return { ...maxRange.value }
    }

    else if (viewConfig.value.isShowAll && !viewConfig.value.isSkipEmpty) {
      return {
        end: dayjs().endOf(interval.value.period).valueOf(),
        start: maxRange.value.start,
      }
    }

    return calculateRange({
      duration: interval.value.duration - 1,
      period: interval.value.period,
      subtracted: subtracted.value,
    })
  })

  watch(range, () => {
    interval.value.selected = -1
  })

  function setRangeByPeriod(rd: FullDuration) {
    params.value.customDate = false
    grouped.value.duration = 1
    grouped.value.period = rd.grouped.period
    grouped.value.duration = rd.grouped.duration
    interval.value.duration = rd.interval.duration
    interval.value.period = rd.interval.period
  }

  function setMaxRange(r: Range) {
    subtracted.value = 0
    params.value.customDate = r
    grouped.value = {
      duration: 1,
      period: 'day',
    }
  }

  function setRangeByCalendar(r: Range) {
    params.value.customDate = r
    subtracted.value = 0

    grouped.value = {
      duration: 1,
      period: 'day',
    }
  }

  function addInterval() {
    params.value.customDate = false
    ++grouped.value.duration
  }

  function delInterval() {
    params.value.customDate = false
    --grouped.value.duration
  }

  // Simplified range modification functions
  function modifyRange(modification: number) {
    params.value.customDate = false
    interval.value.duration += modification
    subtracted.value = 0
  }

  const plusRange = () => modifyRange(1)
  const minusRange = () => modifyRange(-1)

  function setGrouped(values: Interval) {
    params.value.customDate = false
    grouped.value = values
  }

  const groupedPeriods = computed(() => getPeriodsInRange({
    duration: grouped.value.duration,
    period: grouped.value.period,
    range: range.value,
  }))

  return {
    addInterval,
    delInterval,
    getPeriodsInRange,
    grouped,
    groupedPeriods,
    interval,
    minusRange,
    params,
    plusRange,
    range,
    setGrouped,
    setMaxRange,
    setRangeByCalendar,
    setRangeByPeriod,
    subtracted,
    viewConfig,
  }
}

export type IntervalRange = ReturnType<typeof useIntervalRange>
