import dayjs from 'dayjs'
import { useStorage } from '@vueuse/core'
import type { Grouped, IntervalGroupedLabel, Range, statDateParams, statDateParamsQuery } from '~/components/date/types'
import { calculateRange, getPeriodsInRange } from '~/components/date/utils'

export function useStatDate({
  initParams,
  key,
  maxRange,
  queryParams,
}: {
  initParams?: Partial<statDateParams>
  key: string
  maxRange: ComputedRef<Range>
  queryParams?: Partial<statDateParamsQuery>
}) {
  const params = useStorage<statDateParams>(`${key}-params`, {
    customDate: false,
    intervalsBy: 'month',
    intervalsDuration: 1,
    intervalSelected: -1,
    isShowMaxRange: false,
    isSkipEmpty: false,
    rangeBy: 'month',
    rangeDuration: 12,
    rangeOffset: 0,
  })

  if (initParams) {
    params.value = { ...params.value, ...initParams }
  }

  if (queryParams) {
    params.value = {
      ...params.value,
      intervalsBy: queryParams.intervalsBy || params.value.intervalsBy,
      intervalsDuration: queryParams.intervalsDuration ? +queryParams.intervalsDuration : params.value.intervalsDuration,
      intervalSelected: queryParams.intervalSelected ? +queryParams.intervalSelected : params.value.intervalSelected,
      rangeBy: queryParams.rangeBy || params.value.rangeBy,
      rangeDuration: queryParams.rangeDuration ? +queryParams.rangeDuration : params.value.rangeDuration,
      rangeOffset: queryParams.rangeOffset ? +queryParams.rangeOffset : params.value.rangeOffset,
    }
  }

  const range = computed<Range>(() => {
    if (params.value.customDate) {
      return params.value.customDate
    }

    else if (params.value.isShowMaxRange && params.value.isSkipEmpty) {
      return { ...maxRange.value }
    }

    else if (params.value.isShowMaxRange && !params.value.isSkipEmpty) {
      return {
        end: dayjs().endOf(params.value.rangeBy).valueOf(),
        start: maxRange.value.start,
      }
    }

    return calculateRange({
      duration: params.value.rangeDuration - 1,
      period: params.value.rangeBy,
      rangeOffset: params.value.rangeOffset,
    })
  })

  const groupedPeriods = computed(() => getPeriodsInRange({
    duration: params.value.intervalsDuration,
    period: params.value.intervalsBy,
    range: range.value,
  }))

  const selectedInterval = computed(() => groupedPeriods.value[params.value.intervalSelected])

  watch(range, () => params.value.intervalSelected = -1)

  function resetCustomAndMaxRangeParams() {
    params.value.customDate = false
    params.value.isShowMaxRange = false
    params.value.isSkipEmpty = false
  }

  function setRangeByPeriod(igl: IntervalGroupedLabel) {
    resetCustomAndMaxRangeParams()

    params.value.intervalsBy = igl.intervalsBy
    params.value.intervalsDuration = igl.intervalsDuration

    params.value.rangeDuration = igl.rangeDuration
    params.value.rangeBy = igl.rangeBy

    params.value.isSkipEmpty = igl.isSkipEmpty ?? false
    params.value.isShowMaxRange = igl.isShowMaxRange ?? false
  }

  function setRangeByCalendar(r: Range) {
    resetCustomAndMaxRangeParams()
    params.value.customDate = r
    params.value.rangeOffset = 0

    params.value.intervalsBy = 'day'
    params.value.intervalsDuration = 1
  }

  function addInterval() {
    resetCustomAndMaxRangeParams()
    ++params.value.intervalsDuration
  }

  function delInterval() {
    resetCustomAndMaxRangeParams()
    --params.value.intervalsDuration
  }

  function modifyRange(modification: number) {
    resetCustomAndMaxRangeParams()
    params.value.rangeDuration += modification
    params.value.rangeOffset = 0
  }

  const plusRange = () => modifyRange(1)
  const minusRange = () => modifyRange(-1)

  function setGrouped({ intervalsBy, intervalsDuration }: Grouped) {
    resetCustomAndMaxRangeParams()
    params.value.intervalsBy = intervalsBy
    params.value.intervalsDuration = intervalsDuration
  }

  return {
    addInterval,
    delInterval,
    getPeriodsInRange,
    groupedPeriods,
    minusRange,
    params,
    plusRange,
    range,
    selectedInterval,
    setGrouped,
    setRangeByCalendar,
    setRangeByPeriod,
  }
}

export type statDate = ReturnType<typeof useStatDate>
