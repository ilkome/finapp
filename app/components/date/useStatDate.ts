import { useStorage } from '@vueuse/core'
import { differenceInDays } from 'date-fns'
import defu from 'defu'

import type { Grouped, IntervalGroupedLabel, Range, StatDateParams, StatDateParamsQuery } from '~/components/date/types'

import { calculateBestIntervalsBy, getIntervalsInRange } from '~/components/date/utils'

import { computeDateRange, defaultStatDateParams, parseStatDateQueryParams } from './statDateParams'

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
    intervalsBy: params.value.intervalsBy,
    intervalsDuration: params.value.intervalsDuration,
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

    params.value.intervalsBy = igl.intervalsBy
    params.value.intervalsDuration = igl.intervalsDuration

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
    params.value.intervalsBy = 'day'
    params.value.intervalsDuration = 1
  }

  function setMaxRange(isSkipEmpty = false) {
    const rangeDuration = differenceInDays(maxRange.value.end, maxRange.value.start)
    const intervalsBy = calculateBestIntervalsBy(maxRange.value)

    setRangeByPeriod({
      intervalsBy,
      intervalsDuration: 1,
      isShowMaxRange: true,
      isSkipEmpty,
      rangeBy: 'day',
      rangeDuration,
    })
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
    if (params.value.rangeDuration === 1 && modification < 0)
      return

    params.value.rangeDuration += modification
    params.value.rangeOffset = 0
  }

  const plusRange = () => modifyRange(1)
  const minusRange = () => modifyRange(-1)

  function selectInterval(idx: number) {
    params.value.intervalSelected = idx
    const interval = intervalsInRange.value[idx]
    return interval?.start
  }

  function setIntervalsBy(intervalsBy: Grouped['intervalsBy']) {
    resetCustomAndMaxRangeParams()
    params.value.intervalsBy = intervalsBy
  }

  function setInterval({ intervalsBy, intervalsDuration }: Grouped) {
    resetCustomAndMaxRangeParams()
    params.value.intervalsBy = intervalsBy
    params.value.intervalsDuration = intervalsDuration
  }

  return {
    addInterval,
    delInterval,
    intervalsInRange,
    maxRange,
    minusRange,
    modal,
    params,
    plusRange,
    range,
    selectedInterval,
    selectInterval,
    setInterval,
    setIntervalsBy,
    setMaxRange,
    setRangeByCalendar,
    setRangeByPeriod,
  }
}
