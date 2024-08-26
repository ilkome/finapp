import dayjs from 'dayjs'
import { useStorage } from '@vueuse/core'
import type { FullDuration, Interval, Period, Range } from '~/components/date/types'

export function useIntervalRange({ key, maxRange }: { key: string, maxRange: ComputedRef<Range> }) {
  const grouped = useStorage<Interval>(`${key}-grouped`, {
    duration: 1,
    period: 'month',
  })

  const interval = useStorage<Interval>(`${key}-interval`, {
    duration: 12,
    period: 'month',
  })

  const viewConfig = useStorage(`${key}-viewConfig`, {
    isShowAll: false,
    isSkipEmpty: false,
  })

  const subtracted = ref(0)

  const range = computed(() => {
    if (viewConfig.value.isShowAll) {
      return { ...maxRange.value }
    }

    return {
      end: dayjs().subtract(subtracted.value * interval.value.duration, interval.value.period).endOf(interval.value.period).valueOf(),
      start: dayjs().subtract(subtracted.value * interval.value.duration, interval.value.period).subtract(interval.value.duration - 1, interval.value.period).startOf(interval.value.period).valueOf(),
    }
  })

  function setRange(r: Range) {
    subtracted.value = 0
    console.log('setRange', r)
    // range.value = { ...r }
  }

  function getPeriodsWithEmptyTrnsIds(params: {
    duration: number
    period: Period
    range: Range
  }) {
    if (params.duration < 1) {
      return []
    }

    const list: Range[] = []

    let current = {
      end: dayjs(params.range.end).endOf(params.period).valueOf(),
      start: dayjs(params.range.end).subtract(params.duration === 1 ? 0 : params.duration - 1, params.period).startOf(params.period).valueOf(),
    }

    while (current.end > params.range.start) {
      if (current.start < params.range.start) {
        list.unshift({
          end: current.end,
          start: params.range.start,
        })
      }
      else if (current.end > params.range.end) {
        list.unshift({
          end: params.range.end,
          start: current.start,
        })
      }
      else {
        list.unshift(current)
      }

      // TODO: if date less than params.range.start change start date to params.range.start
      current = {
        end: dayjs(current.end).subtract(params.duration, params.period).endOf(params.period).valueOf(),
        start: dayjs(current.start).subtract(params.duration, params.period).startOf(params.period).valueOf(),
      }
    }

    return list
  }

  function setRangeByPeriod(rd: FullDuration) {
    grouped.value = rd.grouped
    interval.value = rd.interval

    // TODO: compute interval
    // range.value = {
    //   end: dayjs().endOf(interval.value.period).valueOf(),
    //   start: dayjs().subtract(rd.interval.duration - 1, interval.value.period).startOf(rd.interval.period).valueOf(),
    // }
  }

  function setRangeByCalendar(r: Range) {
    grouped.value = {
      duration: 1,
      period: 'day',
    }

    interval.value = {
      duration: dayjs(r.end).diff(r.start, 'day') + 1,
      period: 'day',
    }

    // TODO: compute interval
    // range.value = { ...r }
  }

  function addInterval() {
    ++grouped.value.duration
  }

  function delInterval() {
    --grouped.value.duration
  }

  function plusRange() {
    ++interval.value.duration
    range.value.start = dayjs(range.value.start).subtract(1, interval.value.period).startOf(interval.value.period).valueOf()
  }

  function minusRange() {
    --interval.value.duration
    range.value.start = dayjs(range.value.start).add(1, interval.value.period).startOf(interval.value.period).valueOf()
  }

  function setGrouped(values: Interval) {
    grouped.value = values
  }

  return {
    addInterval,
    delInterval,
    getPeriodsWithEmptyTrnsIds,
    grouped,
    interval,
    minusRange,
    plusRange,
    range,
    setGrouped,
    setRange,
    setRangeByCalendar,
    setRangeByPeriod,
    subtracted,
    viewConfig,
  }
}

export type IntervalRange = ReturnType<typeof useIntervalRange>
