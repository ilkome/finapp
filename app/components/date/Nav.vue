<script setup lang="ts">
import dayjs from 'dayjs'
import type { Range } from '~/components/date/types'
import { getStyles } from '~/components/ui/getStyles'
import type { IntervalRange } from '~/components/date/useIntervalRange'

const props = defineProps<{
  intervalRange: IntervalRange
  maxRange: Range
}>()

const isDayToday = computed(() => props.intervalRange.interval.value.period === 'day' && props.intervalRange.interval.value.duration === 1 && props.intervalRange.range.value.end < dayjs().endOf('day').valueOf())

const isEnd = computed(() => {
  // if (props.intervalRange.range.value.end >= props.maxRange.end && !isDayToday.value) {
  //   return true
  // }
  if (props.intervalRange.range.value.end >= dayjs().endOf(props.intervalRange.interval.value.period).valueOf() && !isDayToday.value) {
    return true
  }

  return false
})

const isStart = computed(() => {
  if (props.intervalRange.range.value.start <= props.maxRange.start) {
    return true
  }

  return false
})

// TODO: make walk through interval
function movePeriod(way: 'next' | 'prev' | 'today') {
  if (way === 'next' && !isEnd.value) {
    props.intervalRange.subtracted.value = props.intervalRange.subtracted.value - 1
    return
  }

  if (way === 'prev' && !isStart.value) {
    props.intervalRange.subtracted.value = props.intervalRange.subtracted.value + 1
  }
}
</script>

<template>
  <div class="flex gap-1">
    <div
      :class="[
        getStyles('item', ['link', 'rounded', 'minh2', 'center', 'minw1']),
        { '!hocus:transparent opacity-30': isStart },
      ]"
      class="flex-center bg-item-4"
      @click="movePeriod('prev')"
    >
      <UiIconChevron class="size-8" />
    </div>

    <div
      :class="[
        getStyles('item', ['link', 'rounded', 'minh2', 'center', 'minw1']),
        { '!hocus:transparent opacity-30': isEnd },
      ]"
      class="flex-center bg-item-4"
      @click="movePeriod('next')"
    >
      <UiIconChevron class="size-8 rotate-180" />
    </div>
  </div>
</template>
