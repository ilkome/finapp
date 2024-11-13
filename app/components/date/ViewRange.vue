<script setup lang="ts">
import dayjs from 'dayjs'
import type { Interval, Range } from '~/components/date/types'

const props = defineProps<{
  interval: Interval
  isShowAll: boolean
  range: Range
}>()

const { t } = useI18n()

const date = computed(() => {
  const today = dayjs()

  // One day
  const isOneDay = dayjs(props.range.start).isSame(props.range.end, 'day')
  if (isOneDay) {
    if (dayjs(props.range.start).isToday()) {
      return t('dates.day.current')
    }
    if (dayjs(props.range.start).isYesterday()) {
      return t('dates.day.yesterday')
    }

    // Same year
    if (dayjs(props.range.start).isSame(today, 'year')) {
      return dayjs(props.range.start).format('D MMMM')
    }

    return dayjs(props.range.start).format('D MMMM YYYY')
  }

  // Last periods
  if (!props.isShowAll && dayjs(props.range.end).isSame(today, props.interval.period)) {
    return `${t('dates.last')} ${props.interval.duration} ${props.interval.period}`
  }

  return `${dayjs(props.range.start).format('DD MMM YYYY')} - ${dayjs(props.range.end).format('DD MMM YYYY')}`
})
</script>

<template>
  <div class="flex gap-1 leading-none">
    {{ date }}
  </div>
</template>
