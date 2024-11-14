<script setup lang="ts">
import dayjs from 'dayjs'
import type { IntervalRangeProvider, Range } from '~/components/date/types'

const { t } = useI18n()

const intervalRange = inject('intervalRange') as IntervalRangeProvider

const range = computed<Range>(() => {
  return intervalRange.params.value.intervalSelected !== -1
    ? intervalRange.groupedPeriods.value[intervalRange.params.value.intervalSelected]
      ? intervalRange.groupedPeriods.value[intervalRange.params.value.intervalSelected]!
      : intervalRange.range.value
    : intervalRange.range.value
})

const date = computed(() => {
  const today = dayjs()

  // One day
  const isOneDay = dayjs(range.value.start).isSame(range.value.end, 'day')
  if (isOneDay) {
    if (dayjs(range.value.start).isToday()) {
      return t('dates.day.current')
    }
    if (dayjs(range.value.start).isYesterday()) {
      return t('dates.day.yesterday')
    }

    // Same year
    if (dayjs(range.value.start).isSame(today, 'year')) {
      return dayjs(range.value.start).format('D MMMM')
    }

    return dayjs(range.value.start).format('D MMMM YYYY')
  }

  // Last periods
  if (!intervalRange.params.value.isShowAll && dayjs(range.value.end).isSame(today, intervalRange.params.value.intervalPeriod)) {
    return `${t('dates.last')} ${intervalRange.params.value.intervalDuration} ${intervalRange.params.value.intervalPeriod}`
  }

  return `${dayjs(range.value.start).format('DD MMM YYYY')} - ${dayjs(range.value.end).format('DD MMM YYYY')}`
})
</script>

<template>
  <div class="flex gap-1 leading-none">
    {{ date }}
  </div>
</template>
