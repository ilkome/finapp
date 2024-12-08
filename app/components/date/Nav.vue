<script setup lang="ts">
import { sub } from 'date-fns'
import type { Range, StatDateProvider } from '~/components/date/types'
import { getEndOf, getStartOf } from '~/components/date/utils'
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

const isShowNavHome = computed(() => {
  const start = getStartOf(sub(new Date(), { [`${statDate.params.value.rangeBy}s`]: statDate.params.value.rangeDuration - 1 }), statDate.params.value.rangeBy).getTime()
  const end = getEndOf(new Date(), statDate.params.value.rangeBy).getTime()

  return !statDate.params.value.isShowMaxRange && (statDate.params.value.intervalSelected !== -1 || (statDate.range.value.start !== start && statDate.range.value.end !== end))
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

function clear() {
  statDate.params.value.rangeOffset = 0
  statDate.params.value.intervalSelected = -1
}
</script>

<template>
  <div class="flex items-center gap-1">
    <UiItem3
      v-if="isShowNavHome"
      class="_bg-item-4"
      @click="clear"
    >
      <Icon name="lucide:undo-2" size="20" />
    </UiItem3>

    <UiItem3
      :class="{ '!hocus:transparent opacity-30': isStart }"
      class="bg-item-4"
      @click="movePeriod('prev')"
    >
      <UiIconChevron class="size-6" />
    </UiItem3>

    <UiItem3
      :class="{ '!hocus:transparent opacity-30': isEnd }"
      class="bg-item-4 "
      @click="movePeriod('next')"
    >
      <UiIconChevron class="size-6 rotate-180" />
    </UiItem3>
  </div>
</template>
