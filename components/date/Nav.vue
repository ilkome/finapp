<script setup lang="ts">
import dayjs from 'dayjs'
import type { PeriodDuration, Range } from '~/components/date/types'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  interval: PeriodDuration
  maxRange: Range
  range: Range
}>()

const emit = defineEmits<{
  setRange: [range: Range]
}>()

const isEnd = computed(() => {
  if (props.range.end >= props.maxRange.end) {
    return true
  }

  return false
})

const isStart = computed(() => {
  if (props.range.start <= props.maxRange.start) {
    return true
  }

  return false
})

function movePeriod(way: 'next' | 'prev' | 'today') {
  if (way === 'next' && !isEnd.value) {
    emit('setRange', {
      end: dayjs(props.range.end).add(props.interval.duration, props.interval.period).endOf(props.interval.period).valueOf(),
      start: dayjs(props.range.start).add(props.interval.duration, props.interval.period).startOf(props.interval.period).valueOf(),
    })
  }

  if (way === 'prev' && !isStart.value) {
    emit('setRange', {
      end: dayjs(props.range.end).subtract(props.interval.duration, props.interval.period).endOf(props.interval.period).valueOf(),
      start: dayjs(props.range.start).subtract(props.interval.duration, props.interval.period).startOf(props.interval.period).valueOf(),
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
        { '!hocus:transparent opacity-30': isEnd },
      ]"
      class="flex-center bg-item-4"
      @click="movePeriod('next')"
    >
      <UiIconChevron class="size-8 rotate-180" />
    </div>
  </div>
</template>
