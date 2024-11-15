<script setup lang="ts">
import dayjs from 'dayjs'
import type { StatDateProvider, Range } from '~/components/date/types'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  maxRange: Range
}>()

const statDate = inject('statDate') as StatDateProvider

const isDayToday = computed(() => statDate.params.value.rangeBy === 'day' && statDate.params.value.rangeDuration === 1 && statDate.range.value.end < dayjs().endOf('day').valueOf())

const isEnd = computed(() => {
  // if (statDate.range.value.end >= props.maxRange.end && !isDayToday.value) {
  //   return true
  // }
  if (statDate.range.value.end >= dayjs().endOf(statDate.params.value.rangeBy).valueOf() && !isDayToday.value) {
    return true
  }

  return false
})

const isStart = computed(() => {
  if (statDate.range.value.start <= props.maxRange.start) {
    return true
  }

  return false
})

function movePeriod(way: 'next' | 'prev' | 'today') {
  if (way === 'next' && !isEnd.value) {
    statDate.params.value.rangeOffset = statDate.params.value.rangeOffset - 1
    return
  }

  if (way === 'prev' && !isStart.value) {
    statDate.params.value.rangeOffset = statDate.params.value.rangeOffset + 1
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
