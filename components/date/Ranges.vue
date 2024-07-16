<script setup lang="ts">
import dayjs from 'dayjs'
import type { GroupBy, Range, RangeDuration } from '~/components/date/types'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  groupBy: GroupBy
  range: Range
}>()

const emit = defineEmits<{
  setRangeByPeriod: [r: RangeDuration]
}>()

const ranges: RangeDuration[] = [
  { duration: 7, groupBy: 'period', label: '7d', period: 'day' },
  { duration: 30, groupBy: 'period', label: '30d', period: 'day' },
  { duration: 12, groupBy: 'period', label: '12m', period: 'month' },
  { duration: 24, groupBy: 'period', label: '24m', period: 'month' },
  { duration: 11, groupBy: 'period', label: '11y', period: 'year' },
  { duration: 120, groupBy: 'period', label: '120m', period: 'month' },
  { duration: 60, groupBy: 'period', label: '60d', period: 'day' },
  // { duration: 30, groupBy: 'period', label: 'Last 30 days', period: 'day' },
  { duration: 6, groupBy: 'period', label: '6m', period: 'month' },
  // { duration: 6, groupBy: 'period', label: 'Last 6 months', period: 'month' },
  // { duration: 12, groupBy: 'period', label: 'Last 12 months', period: 'month' },
  { duration: 0, groupBy: 'period', label: 'Today', period: 'day' },
  { duration: 0, groupBy: 'period', label: 'Week', period: 'week' },
  { duration: 3, groupBy: 'period', label: '3W', period: 'week' },
  // { duration: 3, groupBy: 'period', label: 'Last 3 Weeks', period: 'week' },
  // { duration: 7, groupBy: 'period', label: 'Last 7 days', period: 'day' },
  { duration: 0, groupBy: 'period', label: 'This month', period: 'month' },
  { duration: 3, groupBy: 'period', label: '3m', period: 'month' },
  // { duration: 3, groupBy: 'period', label: 'Last 3 months', period: 'month' },
  { duration: 0, groupBy: 'period', label: 'This year', period: 'year' },
  { duration: 3, groupBy: 'period', label: '3y', period: 'year' },
  // { duration: 3, groupBy: 'period', label: 'Last 3 years', period: 'year' },
]

function isRangeSelected(r: RangeDuration) {
  return props.range.end === dayjs().endOf(r.period).valueOf()
    && props.range.start === dayjs().subtract(r.duration === 0 ? 0 : r.duration - 1, r.period).startOf(r.period).valueOf()
}
</script>

<template>
  <div class="flex gap-1">
    <div
      v-for="rangeItem in ranges"
      :key="rangeItem"
      :class="[
        getStyles('item', ['link', 'minh2']), {
          'bg-item-5 rounded': props.groupBy !== 'all' && isRangeSelected(rangeItem),
        },
      ]"
      class="flex items-center px-3 py-0 text-xs bg-item-4 rounded-full leading-none font-primary text-nowrap"
      @click="emit('setRangeByPeriod', rangeItem)"
    >
      {{ rangeItem.label }}
    </div>

    <div
      :class="[
        getStyles('item', ['link', 'minh2']), {
          'bg-item-5 rounded': props.groupBy === 'all',
        },
      ]"
      class="flex items-center px-3 py-0 text-xs bg-item-4 rounded-full leading-none font-primary text-nowrap"

      @click="emit('setRangeByPeriod', { duration: 0, groupBy: 'all', period: 'year' })"
    >
      {{ $t('dates.all.simple') }}
    </div>
  </div>
</template>
