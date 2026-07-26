<script setup lang="ts">
import { sub } from 'date-fns'

import { getEndOf, getStartOf, toDuration } from '~~/utils/date/period'
import { statDateKey } from '~/components/stat/injectionKeys'

const statDate = inject(statDateKey)!

const isShowNav = computed(() =>
  !statDate.params.value.isShowMaxRange
  && (statDate.range.value.start < Date.now()
    || (
      statDate.range.value.start !== statDate.maxRange.value.start
      && statDate.range.value.end !== statDate.maxRange.value.end)))

const isDayToday = computed(() => statDate.params.value.rangeBy === 'day' && statDate.params.value.rangeDuration === 1 && statDate.range.value.end < getEndOf(new Date(), 'day').getTime())

const isEnd = computed(() =>
  statDate.range.value.end >= getEndOf(new Date(), statDate.params.value.rangeBy).getTime() && !isDayToday.value,
)

const isStart = computed(() =>
  statDate.range.value.start <= statDate.maxRange.value.start,
)

const isShowNavHome = computed(() => {
  const start = getStartOf(sub(new Date(), toDuration(statDate.params.value.rangeBy, statDate.params.value.rangeDuration - 1)), statDate.params.value.rangeBy).getTime()
  const end = getEndOf(new Date(), statDate.params.value.rangeBy).getTime()

  return !statDate.params.value.isShowMaxRange && (statDate.params.value.intervalSelected !== -1 || (statDate.range.value.start !== start && statDate.range.value.end !== end))
})

function changeDate(way: 'next' | 'prev' | 'today') {
  if (way === 'next' && !isEnd.value) {
    statDate.params.value.rangeOffset = statDate.params.value.rangeOffset - 1
    return
  }

  if (way === 'prev' && !isStart.value) {
    statDate.params.value.rangeOffset = statDate.params.value.rangeOffset + 1
    return
  }

  if (way === 'today') {
    statDate.params.value.rangeOffset = 0
    statDate.params.value.intervalSelected = -1
  }
}
</script>

<template>
  <div class="flex grow items-center gap-2 overflow-x-auto pt-2">
    <UiNavArrows
      v-if="isShowNav && !statDate.params.value.customDate"
      :isEnd
      :isShowNavHome
      :isStart
      @changeDate="changeDate"
    >
      <StatDateRangeSelector />
    </UiNavArrows>

    <StatDateRangeSelector v-else />

    <slot />
  </div>
</template>
