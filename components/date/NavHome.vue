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

const isPresentRangeSelected = computed(() => {
  if (props.groupBy === 'all')
    return false

  if (props.groupBy === 'daySelector') {
    return props.range.end === props.initialRange.end
      && props.range.start === props.initialRange.start
  }

  return isRangeSelected({
    duration: props.duration,
    groupBy: props.groupBy,
    period: props.period,
  })
})

function isRangeSelected(r: RangeDuration) {
  return props.range.end === dayjs().endOf(r.period).valueOf()
    && props.range.start === dayjs().subtract(r.duration, r.period).startOf(r.period).valueOf()
}

function movePeriod(way: 'next' | 'prev' | 'today') {
  if (props.groupBy === 'all')
    return

  if (way === 'today') {
    if (props.groupBy === 'daySelector') {
      emit('setRange', { ...props.initialRange })
      return
    }

    emit('setRange', {
      end: dayjs().subtract(0, props.period).endOf(props.period).valueOf(),
      start: dayjs().subtract(props.duration, props.period).startOf(props.period).valueOf(),
    })
  }
}
</script>

<template>
  <div
    v-if="!isPresentRangeSelected"
    :class="[
      getStyles('item', ['link', 'rounded', 'minh2']),
    ]"
    class="flex items-center px-3 py-2 text-base font-medium leading-none font-primary text-nowrap"

    @click="movePeriod('today')"
  >
    <UiIconReturn class="size-5" />
  </div>
</template>
