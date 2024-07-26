<script setup lang="ts">
import dayjs from 'dayjs'
import type { FullDuration, PeriodDuration, Range } from '~/components/date/types'

const props = defineProps<{
  grouped: PeriodDuration
  interval: PeriodDuration
  maxRange: Range
  range: Range
}>()

const emit = defineEmits<{
  setRangeByPeriod: [d: FullDuration]
}>()

const ranges = computed<FullDuration[]>(() => [
  {
    grouped: { duration: 1, period: 'day' },
    interval: { duration: 7, period: 'day' },
    label: '7d',
  },
  {
    grouped: { duration: 1, period: 'day' },
    interval: { duration: 14, period: 'day' },
    label: '14d',
  },
  {
    grouped: { duration: 1, period: 'day' },
    interval: { duration: 30, period: 'day' },
    label: '30d',
  },
  {
    grouped: { duration: 1, period: 'month' },
    interval: { duration: 6, period: 'month' },
    label: '6m',
  },
  {
    grouped: { duration: 1, period: 'month' },
    interval: { duration: 12, period: 'month' },
    label: '12m',
  },
  {
    grouped: { duration: 1, period: 'day' },
    interval: { duration: 1, period: 'week' },
    label: 'Week',
  },
  {
    grouped: { duration: 1, period: 'day' },
    interval: { duration: 1, period: 'month' },
    label: 'Month',
  },
  {
    grouped: { duration: 1, period: 'month' },
    interval: { duration: 1, period: 'year' },
    label: 'Year',
  },
  {
    grouped: { duration: 1, period: 'year' },
    interval: { duration: dayjs(props.maxRange.end).diff(props.maxRange.start, 'day'), period: 'day' },
    label: 'All',
  },
])

function isRangeSelected(rd: FullDuration) {
  return rd.interval.duration === props.interval.duration && rd.interval.period === props.interval.period
}
</script>

<template>
  <div class="grid gap-1">
    <DateLinkItem
      v-for="rangeItem in ranges"
      :key="rangeItem"
      :isActive="isRangeSelected(rangeItem)"
      @click="emit('setRangeByPeriod', rangeItem)"
    >
      {{ rangeItem.label }}
    </DateLinkItem>
  </div>
</template>
