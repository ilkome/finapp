<script setup lang="ts">
import dayjs from 'dayjs'
import type { FullDuration, Interval, Range } from '~/components/date/types'

const props = defineProps<{
  interval: Interval
  maxRange: Range
}>()

const emit = defineEmits<{
  setMaxRange: [d: Range]
  setRangeByPeriod: [d: FullDuration]
}>()

const { t } = useI18n()

const ranges = computed<FullDuration[]>(() => [
  {
    grouped: { duration: 1, period: 'day' },
    interval: { duration: 1, period: 'day' },
    label: t('dates.day.simple'),
  },
  {
    grouped: { duration: 1, period: 'day' },
    interval: { duration: 1, period: 'week' },
    label: t('dates.week.simple'),
  },
  {
    grouped: { duration: 1, period: 'day' },
    interval: { duration: 1, period: 'month' },
    label: t('dates.month.simple'),
  },
  {
    grouped: { duration: 1, period: 'month' },
    interval: { duration: 1, period: 'year' },
    label: t('dates.year.simple'),
  },
])

function isRangeSelected(rd: FullDuration) {
  return rd.interval.duration === props.interval.duration && rd.interval.period === props.interval.period
}
</script>

<template>
  <DateLinkItem
    v-for="rangeItem in ranges"
    :key="rangeItem.label"
    :isActive="isRangeSelected(rangeItem)"
    @click="emit('setRangeByPeriod', rangeItem)"
  >
    {{ rangeItem.label }}
  </DateLinkItem>
</template>

<i18n lang="yaml">
en:
  max: "Max"
ru:
  max: "Максимально"
</i18n>
