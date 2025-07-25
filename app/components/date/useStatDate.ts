import { useStorage } from '@vueuse/core'
import { differenceInDays } from 'date-fns'
import defu from 'defu'
import { z } from 'zod/v4'

import type { Grouped, IntervalGroupedLabel, Range, StatDateParams, StatDateParamsQuery } from '~/components/date/types'

import { periods } from '~/components/date/types'
import { calculateBestIntervalsBy, calculateIntervalInRange, getEndOf, getIntervalsInRange } from '~/components/date/utils'

const queryParamsSchema = z.object({
  intervalsBy: z.enum(periods).optional(),
  intervalsDuration: z.string().transform(val => Number(val)).pipe(z.number().int()).optional(),
  intervalSelected: z.string().transform(val => Number(val)).pipe(z.number().int()).optional(),
  isShowMaxRange: z.string().transform(val => val === 'true').optional(),
  isSkipEmpty: z.string().transform(val => val === 'true').optional(),
  rangeBy: z.enum(periods).optional(),
  rangeDuration: z.string().transform(val => Number(val)).pipe(z.number().int()).optional(),
  rangeOffset: z.string().transform(val => Number(val)).pipe(z.number().int()).optional(),
})

const defaultParams: StatDateParams = {
  customDate: false,
  intervalsBy: 'week',
  intervalsDuration: 1,
  intervalSelected: -1,
  isShowMaxRange: false,
  isSkipEmpty: false,
  rangeBy: 'month',
  rangeDuration: 3,
  rangeOffset: 0,
}

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
    params.value = defu(initParams ?? {}, defaultParams)
  }

  const modals = ref({
    dateSelector: false,
  })

  if (queryParams) {
    const parsed = queryParamsSchema.safeParse(queryParams)

    if (!parsed.success)
      return

    const data = parsed.data
    if (data.intervalsBy)
      params.value.intervalsBy = data.intervalsBy
    if (data.intervalsDuration)
      params.value.intervalsDuration = data.intervalsDuration
    if (data.intervalSelected)
      params.value.intervalSelected = data.intervalSelected
    if (data.rangeBy)
      params.value.rangeBy = data.rangeBy
    if (data.rangeDuration)
      params.value.rangeDuration = data.rangeDuration
    if (data.rangeOffset)
      params.value.rangeOffset = data.rangeOffset
    if (data.isShowMaxRange !== undefined)
      params.value.isShowMaxRange = data.isShowMaxRange
    if (data.isSkipEmpty !== undefined)
      params.value.isSkipEmpty = data.isSkipEmpty
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
    setMaxRange,
    setRangeByCalendar,
    setRangeByPeriod,
  }
}

export type statDate = ReturnType<typeof useStatDate>
