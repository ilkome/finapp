<script setup lang="ts">
import dayjs from 'dayjs'
import type { FullDuration, Interval, Range } from '~/components/date/types'

const props = defineProps<{
  interval: Interval
  maxRange: Range
}>()

const emit = defineEmits<{
  setRange: [d: Range]
  setRangeByPeriod: [d: FullDuration]
}>()

const ranges = computed<FullDuration[]>(() => [
  {
    grouped: { duration: 1, period: 'day' },
    interval: { duration: 1, period: 'day' },
    label: 'Day',
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
    interval: { duration: dayjs(dayjs().endOf('day')).diff(props.maxRange.start, 'day') + 1, period: 'day' },
    label: 'All',
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

  <DateLinkItem @click="emit('setRange', props.maxRange)">
    All 2
  </DateLinkItem>
</template>
