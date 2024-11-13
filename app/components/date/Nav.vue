<script setup lang="ts">
import dayjs from 'dayjs'
import type { IntervalRangeProvider, Range } from '~/components/date/types'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  maxRange: Range
}>()

const intervalRange = inject('intervalRange') as IntervalRangeProvider

const isDayToday = computed(() => intervalRange.params.value.intervalPeriod === 'day' && intervalRange.params.value.intervalDuration === 1 && intervalRange.range.value.end < dayjs().endOf('day').valueOf())

const isEnd = computed(() => {
  // if (intervalRange.range.value.end >= props.maxRange.end && !isDayToday.value) {
  //   return true
  // }
  if (intervalRange.range.value.end >= dayjs().endOf(intervalRange.params.value.intervalPeriod).valueOf() && !isDayToday.value) {
    return true
  }

  return false
})

const isStart = computed(() => {
  if (intervalRange.range.value.start <= props.maxRange.start) {
    return true
  }

  return false
})

function movePeriod(way: 'next' | 'prev' | 'today') {
  if (way === 'next' && !isEnd.value) {
    intervalRange.params.value.subtracted = intervalRange.params.value.subtracted - 1
    return
  }

  if (way === 'prev' && !isStart.value) {
    intervalRange.params.value.subtracted = intervalRange.params.value.subtracted + 1
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
