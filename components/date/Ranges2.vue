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
  { duration: 0, groupBy: 'period', label: 'Today', period: 'day' },
  { duration: 0, groupBy: 'period', label: 'Week', period: 'week' },
  { duration: 7, groupBy: 'period', label: 'Last 7 days', period: 'day' },
  { duration: 0, groupBy: 'period', label: 'This month', period: 'month' },
  { duration: 3, groupBy: 'period', label: 'Last 3 months', period: 'month' },
  { duration: 6, groupBy: 'period', label: 'Last 6 months', period: 'month' },
  { duration: 0, groupBy: 'period', label: 'This year', period: 'year' },
  { duration: 3, groupBy: 'period', label: 'Last 3 years', period: 'year' },
]

function isRangeSelected(r: RangeDuration) {
  return props.range.end === dayjs().endOf(r.period).valueOf()
    && props.range.start === dayjs().subtract(r.duration === 0 ? 0 : r.duration - 1, r.period).startOf(r.period).valueOf()
}
</script>

<template>
  <div class="min-w-[180px] bg-item-4 grid gap-1 p-2 overflow-hidden">
    <div
      v-for="rangeItem in ranges"
      :key="rangeItem"
      :class="[
        getStyles('item', ['link', 'rounded', 'padding1', 'minh2']), {
          'bg-item-5 rounded': props.groupBy !== 'all' && isRangeSelected(rangeItem),
        },
      ]"
      class="flex items-center px-3 py-2 text-base font-medium leading-none font-primary text-nowrap"
      @click="emit('setRangeByPeriod', rangeItem)"
    >
      {{ rangeItem.label }}
    </div>

    <div
      :class="[
        getStyles('item', ['link', 'rounded', 'minh2']), {
          'bg-item-5 rounded': props.groupBy === 'all',
        },
      ]"
      class="flex items-center px-3 py-2 text-base font-medium leading-none font-primary text-nowrap"

      @click="emit('setRangeByPeriod', { duration: 0, groupBy: 'all', period: 'year' })"
    >
      {{ $t('dates.all.simple') }}
    </div>
  </div>
</template>
