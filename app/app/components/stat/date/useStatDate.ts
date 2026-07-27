import type { Range } from '~~/utils/date/types'

import { useStorage } from '@vueuse/core'
import { differenceInDays } from 'date-fns'
import defu from 'defu'

import type { Grouped, IntervalGroupedLabel, StatDateParams, StatDateParamsQuery } from '~/components/stat/date/types'

import { calculateBestGranularityBy, computeDateRange, defaultStatDateParams, getIntervalsInRange, parseStatDateQueryParams } from './params'

export function useStatDate({
  initParams,
  key,
  maxRange,
  queryParams,
}: {
  initParams?: Partial<StatDateParams>
  key: string
  maxRange: ComputedRef<Range>
  queryParams?: Partial<StatDateParamsQuery>
}) {
  const params = useStorage<StatDateParams>(`${key}-params`, {} as StatDateParams, localStorage, {
    mergeDefaults: (storageValue, defaults) => defu(storageValue, defaults),
  })

  if (Object.keys(params.value).length === 0) {
    params.value = defu(initParams ?? {}, defaultStatDateParams)
  }

  const modal = ref({
    dateSelector: false,
  })

  if (queryParams) {
    params.value = parseStatDateQueryParams(queryParams, params.value)
  }

  const range = computed<Range>(() =>
    computeDateRange(params.value, maxRange.value, Date.now()),
  )

  const intervalsInRange = computed(() => getIntervalsInRange({
    granularityBy: params.value.granularityBy,
    granularityDuration: params.value.granularityDuration,
    range: range.value,
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

    params.value.granularityBy = igl.granularityBy
    params.value.granularityDuration = igl.granularityDuration

    params.value.rangeDuration = igl.rangeDuration
    params.value.rangeBy = igl.rangeBy

    params.value.isSkipEmpty = igl.isSkipEmpty || false
    params.value.isShowMaxRange = igl.isShowMaxRange || false
  }

  function setRangeByCalendar(r: Range) {
    resetCustomAndMaxRangeParams()
    params.value.customDate = { ...r }
    params.value.rangeOffset = 0

    params.value.rangeBy = 'day'
    params.value.rangeDuration = differenceInDays(r.end, r.start) + 1
    params.value.granularityBy = 'day'
    params.value.granularityDuration = 1
  }

  function setMaxRange(isSkipEmpty = false) {
    const rangeDuration = differenceInDays(maxRange.value.end, maxRange.value.start)
    const granularityBy = calculateBestGranularityBy(maxRange.value)

    setRangeByPeriod({
      granularityBy,
      granularityDuration: 1,
      isShowMaxRange: true,
      isSkipEmpty,
      rangeBy: 'day',
      rangeDuration,
    })
  }

  function plusGranularity() {
    resetCustomAndMaxRangeParams()
    ++params.value.granularityDuration
  }

  function minusGranularity() {
    resetCustomAndMaxRangeParams()
    if (params.value.granularityDuration > 1)
      --params.value.granularityDuration
  }

  function modifyRange(modification: number) {
    resetCustomAndMaxRangeParams()
    if (params.value.rangeDuration === 1 && modification < 0)
      return

    params.value.rangeDuration += modification
    params.value.rangeOffset = 0
  }

  const plusRange = () => modifyRange(1)
  const minusRange = () => modifyRange(-1)

  function selectInterval(idx: number) {
    if (params.value.intervalSelected === idx) {
      params.value.intervalSelected = -1
      return undefined
    }

    params.value.intervalSelected = idx
    const interval = intervalsInRange.value[idx]
    return interval?.start
  }

  function setGranularityBy(granularityBy: Grouped['granularityBy']) {
    resetCustomAndMaxRangeParams()
    params.value.granularityBy = granularityBy
  }

  function setGranularity({ granularityBy, granularityDuration }: Grouped) {
    resetCustomAndMaxRangeParams()
    params.value.granularityBy = granularityBy
    params.value.granularityDuration = granularityDuration
  }

  return {
    intervalsInRange,
    maxRange,
    minusGranularity,
    minusRange,
    modal,
    params,
    plusGranularity,
    plusRange,
    range,
    selectedInterval,
    selectInterval,
    setGranularity,
    setGranularityBy,
    setMaxRange,
    setRangeByCalendar,
    setRangeByPeriod,
  }
}
