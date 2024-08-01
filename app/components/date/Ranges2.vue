<script setup lang="ts">
import dayjs from 'dayjs'
import type { FullDuration, Interval, Range } from '~/components/date/types'

const props = defineProps<{
  interval: Interval
  maxRange: Range
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
    grouped: { duration: 1, period: 'year' },
    interval: { duration: 6, period: 'year' },
    label: '6y',
  },
  {
    grouped: { duration: 1, period: 'year' },
    interval: { duration: 10, period: 'year' },
    label: '10y',
  },
])

function isRangeSelected(rd: FullDuration) {
  return rd.interval.duration === props.interval.duration && rd.interval.period === props.interval.period
}
</script>

<template>
  <DateLinkItem
    v-for="rangeItem in ranges"
    :key="rangeItem"
    :isActive="isRangeSelected(rangeItem)"
    @click="emit('setRangeByPeriod', rangeItem)"
  >
    {{ rangeItem.label }}
  </DateLinkItem>
</template>
