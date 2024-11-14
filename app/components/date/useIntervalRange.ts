import dayjs from 'dayjs'
import zod from 'zod'
import { useStorage } from '@vueuse/core'
import type { Grouped, IntervalGroupedLabel, IntervalRangeParams, IntervalRangeParamsQuery, Range } from '~/components/date/types'
import { calculateRange, getPeriodsInRange } from '~/components/date/utils'

export function useIntervalRange({ key, maxRange, queryParams }: { key: string, maxRange: ComputedRef<Range>, queryParams?: Partial<IntervalRangeParamsQuery> }) {
  const params = useStorage<IntervalRangeParams>(`${key}-params`, {
    customDate: false,
    groupedBy: 'month',
    groupedDuration: 1,
    intervalDuration: 12,
    intervalPeriod: 'month',
    intervalSelected: -1,
    isShowAll: false,
    isSkipEmpty: false,
    subtracted: 0,
  })

  if (queryParams) {
    // TODO: check queryParams with zod
    params.value = {
      ...params.value,
      groupedBy: queryParams.groupedBy || params.value.groupedBy,
      groupedDuration: queryParams.groupedDuration ? +queryParams.groupedDuration : params.value.groupedDuration,
      intervalDuration: queryParams.intervalDuration ? +queryParams.intervalDuration : params.value.intervalDuration,
      intervalPeriod: queryParams.intervalPeriod || params.value.intervalPeriod,
      intervalSelected: queryParams.intervalSelected ? +queryParams.intervalSelected : params.value.intervalSelected,
      subtracted: queryParams.subtracted ? +queryParams.subtracted : params.value.subtracted,
    }
  }

  const range = computed<Range>(() => {
    if (params.value.customDate) {
      return params.value.customDate
    }

    else if (params.value.isShowAll && params.value.isSkipEmpty) {
      return { ...maxRange.value }
    }

    else if (params.value.isShowAll && !params.value.isSkipEmpty) {
      return {
        end: dayjs().endOf(params.value.intervalPeriod).valueOf(),
        start: maxRange.value.start,
      }
    }

    return calculateRange({
      duration: params.value.intervalDuration - 1,
      period: params.value.intervalPeriod,
      subtracted: params.value.subtracted,
    })
  })

  watch(range, () => {
    params.value.intervalSelected = -1
  })

  function setRangeByPeriod(igl: IntervalGroupedLabel) {
    params.value.customDate = false

    params.value.groupedBy = igl.groupedBy
    params.value.groupedDuration = igl.groupedDuration

    params.value.intervalDuration = igl.intervalDuration
    params.value.intervalPeriod = igl.intervalPeriod
  }

  function setMaxRange(r: Range) {
    params.value.subtracted = 0
    params.value.customDate = r
    params.value.groupedBy = 'day'
    params.value.groupedDuration = 1
  }

  function setRangeByCalendar(r: Range) {
    params.value.customDate = r
    params.value.subtracted = 0

    params.value.groupedBy = 'day'
    params.value.groupedDuration = 1
  }

  function addInterval() {
    params.value.customDate = false
    ++params.value.groupedDuration
  }

  function delInterval() {
    params.value.customDate = false
    --params.value.groupedDuration
  }

  function modifyRange(modification: number) {
    params.value.customDate = false
    params.value.intervalDuration += modification
    params.value.subtracted = 0
  }

  const plusRange = () => modifyRange(1)
  const minusRange = () => modifyRange(-1)

  function setGrouped({ groupedBy, groupedDuration }: Grouped) {
    params.value.customDate = false
    params.value.groupedBy = groupedBy
    params.value.groupedDuration = groupedDuration
  }

  const groupedPeriods = computed(() => getPeriodsInRange({
    duration: params.value.groupedDuration,
    period: params.value.groupedBy,
    range: range.value,
  }))

  return {
    addInterval,
    delInterval,
    getPeriodsInRange,
    groupedPeriods,
    minusRange,
    params,
    plusRange,
    range,
    setGrouped,
    setMaxRange,
    setRangeByCalendar,
    setRangeByPeriod,
  }
}

export type IntervalRange = ReturnType<typeof useIntervalRange>
