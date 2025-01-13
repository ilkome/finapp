import { useStorage } from '@vueuse/core'

import type { Grouped, IntervalGroupedLabel, Range, StatDateParams, StatDateParamsQuery } from '~/components/date/types'

import { calculateIntervalInRange, getEndOf, getIntervalsInRange } from '~/components/date/utils'

export function useStatDate({
  key,
  maxRange,
  queryParams,
}: {
  initParams?: Partial<StatDateParams>
  key: string
  maxRange: ComputedRef<Range>
  queryParams?: Partial<StatDateParamsQuery>
}) {
  const params = useStorage<StatDateParams>(`${key}-params2`, {
    customDate: false,
    intervalsBy: 'week',
    intervalsDuration: 1,
    intervalSelected: -1,
    isShowMaxRange: false,
    isSkipEmpty: false,
    rangeBy: 'month',
    rangeDuration: 3,
    rangeOffset: 0,
  }, localStorage, {
    mergeDefaults: true,
  })

  const modals = ref({
    dateSelector: false,
  })

  if (queryParams) {
    if (queryParams.intervalsBy)
      params.value.intervalsBy = queryParams.intervalsBy

    if (Number.isInteger(+queryParams.intervalsDuration))
      params.value.intervalsDuration = +queryParams.intervalsDuration

    if (Number.isInteger(+queryParams.intervalSelected))
      params.value.intervalSelected = +queryParams.intervalSelected

    if (queryParams.rangeBy)
      params.value.rangeBy = queryParams.rangeBy

    if (Number.isInteger(+queryParams.rangeDuration))
      params.value.rangeDuration = +queryParams.rangeDuration

    if (Number.isInteger(+queryParams.rangeOffset))
      params.value.rangeOffset = +queryParams.rangeOffset

    if (queryParams.isShowMaxRange)
      params.value.isShowMaxRange = queryParams.isShowMaxRange === 'true'

    if (queryParams.isSkipEmpty)
      params.value.isSkipEmpty = queryParams.isSkipEmpty === 'true'
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
        end: getEndOf(new Date(), params.value.rangeBy).getTime(),
        start: maxRange.value.start,
      }
    }

    const range = calculateIntervalInRange({
      intervalsBy: params.value.rangeBy,
      intervalsDuration: params.value.rangeDuration,
      range: {
        end: new Date().getTime(),
        start: new Date().getTime(),
      },
      rangeOffset: params.value.rangeOffset,
    })

    return range
  })

  const intervalsInRange = computed(() => getIntervalsInRange({
    intervalsBy: params.value.intervalsBy,
    intervalsDuration: params.value.intervalsDuration,
    range: range.value,
    rangeOffset: params.value.rangeOffset,
  }))

  const selectedInterval = computed(() => intervalsInRange.value[params.value.intervalSelected])

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

    params.value.isSkipEmpty = igl.isSkipEmpty || false
    params.value.isShowMaxRange = igl.isShowMaxRange || false
  }

  function setRangeByCalendar(r: Range) {
    resetCustomAndMaxRangeParams()
    params.value.customDate = {
      end: new Date(r.end).getTime(),
      start: new Date(r.start).getTime(),
    }
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
    if (params.value.intervalsDuration > 1)
      --params.value.intervalsDuration
  }

  function modifyRange(modification: number) {
    resetCustomAndMaxRangeParams()
    params.value.rangeDuration += modification
    params.value.rangeOffset = 0
  }

  const plusRange = () => modifyRange(1)
  const minusRange = () => modifyRange(-1)

  function setInterval({ intervalsBy, intervalsDuration }: Grouped) {
    resetCustomAndMaxRangeParams()
    params.value.intervalsBy = intervalsBy
    params.value.intervalsDuration = intervalsDuration
  }

  return {
    addInterval,
    delInterval,
    getIntervalsInRange,
    intervalsInRange,
    maxRange,
    minusRange,
    modals,
    params,
    plusRange,
    range,
    selectedInterval,
    setInterval,
    setRangeByCalendar,
    setRangeByPeriod,
  }
}

export type statDate = ReturnType<typeof useStatDate>
