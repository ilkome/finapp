<script setup lang="ts">
import type { Range, StatDateProvider } from '~/components/date/types'
import { getEndOf } from '~/components/date/utils'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  maxRange: Range
}>()

const statDate = inject('statDate') as StatDateProvider

const isDayToday = computed(() => statDate.params.value.rangeBy === 'day' && statDate.params.value.rangeDuration === 1 && statDate.range.value.end < getEndOf(new Date(), 'day').getTime())

const isEnd = computed(() => {
  if (statDate.range.value.end >= getEndOf(new Date(), statDate.params.value.rangeBy).getTime() && !isDayToday.value) {
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
