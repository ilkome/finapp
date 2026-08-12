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

  // Backfill defaults on every load, not just the first: a payload stored before a param
  // rename keeps the dead key and misses the new one, and an undefined Period crashes date math.
  params.value = Object.keys(params.value).length === 0
    ? defu(initParams ?? {}, defaultStatDateParams)
    : defu(params.value, defaultStatDateParams)

  const modal = ref({
    dateSelector: false,
  })

  if (queryParams) {
    params.value = parseStatDateQueryParams(queryParams, params.value)
  }

  const scrollRangeOffset = shallowRef<number | null>(null)
  const scrollRangeResetVersion = shallowRef(0)

  const effectiveParams = computed<StatDateParams>(() => ({
    customDate: params.value.customDate,
    granularityBy: params.value.granularityBy,
    granularityDuration: params.value.granularityDuration,
    intervalSelected: params.value.intervalSelected,
    isShowMaxRange: params.value.isShowMaxRange,
    isSkipEmpty: params.value.isSkipEmpty,
    rangeBy: params.value.rangeBy,
    rangeDuration: params.value.rangeDuration,
    rangeOffset: scrollRangeOffset.value ?? params.value.rangeOffset,
  }))

  const range = computed<Range>(() => {
    return computeDateRange({
      customDate: params.value.customDate,
      granularityBy: params.value.granularityBy,
      granularityDuration: params.value.granularityDuration,
      intervalSelected: -1,
      isShowMaxRange: params.value.isShowMaxRange,
      isSkipEmpty: params.value.isSkipEmpty,
      rangeBy: params.value.rangeBy,
      rangeDuration: params.value.rangeDuration,
      rangeOffset: scrollRangeOffset.value ?? params.value.rangeOffset,
    }, maxRange.value, Date.now())
  })

  const isScrollRangeOverridden = computed(() => scrollRangeOffset.value !== null && scrollRangeOffset.value !== params.value.rangeOffset)

  const intervalsInRange = computed(() => getIntervalsInRange({
    granularityBy: params.value.granularityBy,
    granularityDuration: params.value.granularityDuration,
    range: range.value,
  }))

  const selectedInterval = computed(() => intervalsInRange.value[params.value.intervalSelected])

  // Set right before a range change that must land on an edge interval instead of the whole
  // range (arrow stepping past the first/last interval - see stepInterval).
  let landOn: 'first' | 'last' | null = null

  watch(range, (nextRange, previousRange) => {
    if (nextRange.start === previousRange.start && nextRange.end === previousRange.end)
      return

    const intervals = intervalsInRange.value
    params.value.intervalSelected = landOn === 'first'
      ? 0
      : landOn === 'last'
        ? Math.max(intervals.length - 1, 0)
        : -1
    landOn = null
  })

  watch(() => [
    params.value.customDate,
    params.value.granularityBy,
    params.value.granularityDuration,
    params.value.isShowMaxRange,
    params.value.rangeBy,
    params.value.rangeDuration,
    params.value.rangeOffset,
  ], () => {
    clearScrollRangeOffset()
  })

  function setScrollRangeOffset(rangeOffset: number) {
    if (params.value.intervalSelected !== -1)
      params.value.intervalSelected = -1
    scrollRangeOffset.value = rangeOffset
  }

  function clearScrollRangeOffset() {
    scrollRangeOffset.value = null
  }

  function resetScrollRange() {
    clearScrollRangeOffset()
    scrollRangeResetVersion.value++
  }

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

  /**
   * Arrow step while an interval is selected: walk intervals inside the range, and at either
   * edge roll into the neighbouring range landing on its opposite edge interval (last day of
   * the previous month, first day of the next). Bounds are enforced by the caller's
   * isStart/isEnd, same as plain range stepping.
   */
  function stepInterval(direction: 1 | -1) {
    const next = params.value.intervalSelected + direction
    if (next >= 0 && next < intervalsInRange.value.length) {
      params.value.intervalSelected = next
      return
    }
    landOn = direction === 1 ? 'first' : 'last'
    params.value.rangeOffset -= direction
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
    clearScrollRangeOffset,
    effectiveParams,
    intervalsInRange,
    isScrollRangeOverridden,
    maxRange,
    minusGranularity,
    minusRange,
    modal,
    params,
    plusGranularity,
    plusRange,
    range,
    resetScrollRange,
    scrollRangeOffset,
    scrollRangeResetVersion,
    selectedInterval,
    selectInterval,
    setGranularity,
    setGranularityBy,
    setMaxRange,
    setRangeByCalendar,
    setRangeByPeriod,
    setScrollRangeOffset,
    stepInterval,
  }
}
