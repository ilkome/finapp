<script setup lang="ts">
import { isEnd as computeIsEnd, isShowNav as computeIsShowNav, isShowNavHome as computeIsShowNavHome, isStart as computeIsStart } from '~/components/stat/date/navigationPredicates'
import { statDateKey } from '~/components/stat/injectionKeys'

const statDate = inject(statDateKey)!

const isShowNav = computed(() => computeIsShowNav(statDate.params.value, statDate.range.value, statDate.maxRange.value, new Date()))

const isEnd = computed(() => computeIsEnd(statDate.params.value, statDate.range.value, new Date()))

const isStart = computed(() => computeIsStart(statDate.range.value, statDate.maxRange.value))

const isShowNavHome = computed(() => computeIsShowNavHome(statDate.params.value, statDate.range.value, new Date()))

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
      <StatDateRangeButton />
    </UiNavArrows>

    <StatDateRangeButton v-else />

    <slot />
  </div>
</template>
