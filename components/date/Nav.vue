<script setup lang="ts">
import dayjs from 'dayjs'
import type { GroupBy, Period, Range, RangeDuration } from '~/components/date/types'
import { getIntervalDates } from '~/components/date/utils'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  duration: number
  groupBy: GroupBy
  initialRange: Range
  maxRange: Range
  period: Period
  range: Range
}>()

const emit = defineEmits<{
  setRange: [range: Range]
}>()

const isEnd = computed(() => {
  if (props.groupBy === 'all')
    return false

  if (props.range.end >= dayjs(props.maxRange.end).endOf(props.period).valueOf()) {
    return true
  }

  return false
})

const isStart = computed(() => {
  if (props.groupBy === 'all')
    return false

  if (props.range.start <= dayjs(props.maxRange.start).startOf(props.period).valueOf()) {
    return true
  }

  return false
})

function movePeriod(way: 'next' | 'prev' | 'today') {
  if (props.groupBy === 'all')
    return

  const num = props.groupBy === 'daySelector'
    ? getIntervalDates(props.range, props.period).length
    : props.duration + 1

  if (way === 'next') {
    emit('setRange', {
      end: dayjs(props.range.end).add(num, props.period).endOf(props.period).valueOf(),
      start: dayjs(props.range.start).add(num, props.period).startOf(props.period).valueOf(),
    })
  }

  if (way === 'prev') {
    emit('setRange', {
      end: dayjs(props.range.end).subtract(num, props.period).endOf(props.period).valueOf(),
      start: dayjs(props.range.start).subtract(num, props.period).startOf(props.period).valueOf(),
    })
  }
}
</script>

<template>
  <div class="flex gap-1">
    <div
      :class="[
        ...getStyles('item', ['link', 'rounded', 'minh2', 'center', 'minw1']),
        { '!hocus:transparent opacity-30': isStart },
      ]"
      class="flex-center bg-item-4"
      @click="movePeriod('prev')"
    >
      <UiIconChevron class="size-8" />
    </div>

    <div
      :class="[
        ...getStyles('item', ['link', 'rounded', 'minh2', 'center', 'minw1']),
        {
          '!hocus:transparent opacity-30': isEnd,
        },
      ]"
      class="flex-center bg-item-4"
      @click="movePeriod('next')"
    >
      <UiIconChevron class="size-8 rotate-180" />
    </div>
  </div>
</template>
