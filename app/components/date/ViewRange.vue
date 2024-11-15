<script setup lang="ts">
import dayjs from 'dayjs'
import type { Range, StatDateProvider } from '~/components/date/types'

const { t } = useI18n()

const statDate = inject('statDate') as StatDateProvider

const range = computed<Range>(() => {
  return statDate.params.value.intervalSelected !== -1
    ? statDate.groupedPeriods.value[statDate.params.value.intervalSelected]
      ? statDate.groupedPeriods.value[statDate.params.value.intervalSelected]!
      : statDate.range.value
    : statDate.range.value
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
  if (!statDate.params.value.isShowMaxRange && dayjs(range.value.end).isSame(today, statDate.params.value.rangeBy)) {
    return `${t('dates.last')} ${statDate.params.value.rangeDuration} ${statDate.params.value.rangeBy}`
  }

  return `${dayjs(range.value.start).format('DD MMM YYYY')} - ${dayjs(range.value.end).format('DD MMM YYYY')}`
})
</script>

<template>
  <div class="flex gap-1 leading-none">
    {{ date }}
  </div>
</template>
