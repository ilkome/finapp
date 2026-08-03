<script setup lang="ts">
import { isEnd as computeIsEnd, isShowNav as computeIsShowNav, isShowNavHome as computeIsShowNavHome, isStart as computeIsStart } from '~/components/stat/date/navigationPredicates'
import { statDateKey, statStickyNavKey } from '~/components/stat/injectionKeys'

const statDate = inject(statDateKey)!
const stickyNav = inject(statStickyNavKey, false)

const isShowNav = computed(() => computeIsShowNav(statDate.params.value, statDate.range.value, statDate.maxRange.value, new Date()))

const isIntervalStep = computed(() => statDate.params.value.intervalSelected !== -1)

// The window the arrows actually move, and the unit they move it by.
const navRange = computed(() => (isIntervalStep.value && statDate.selectedInterval.value) || statDate.range.value)
const navBy = computed(() => isIntervalStep.value ? statDate.params.value.granularityBy : statDate.params.value.rangeBy)
const navDuration = computed(() => isIntervalStep.value ? statDate.params.value.granularityDuration : statDate.params.value.rangeDuration)

const isEnd = computed(() => computeIsEnd(statDate.params.value, navRange.value, new Date(), navBy.value, navDuration.value))

const isStart = computed(() => computeIsStart(navRange.value, statDate.maxRange.value))

const isShowNavHome = computed(() => computeIsShowNavHome(statDate.params.value, statDate.range.value, new Date()))

function changeDate(way: 'next' | 'prev' | 'today') {
  if (way === 'today') {
    statDate.params.value.rangeOffset = 0
    statDate.params.value.intervalSelected = -1
    statDate.resetScrollRange()
    return
  }

  if (way === 'next' ? isEnd.value : isStart.value)
    return

  const direction = way === 'next' ? 1 : -1
  // An interval is selected -> the arrows step intervals (days inside a month, months
  // inside a year) and roll into the neighbouring range at the edges.
  if (statDate.params.value.intervalSelected !== -1)
    statDate.stepInterval(direction)
  else
    statDate.params.value.rangeOffset -= direction
}
</script>

<template>
  <div
    class="stat-date-navigation flex grow items-center gap-2 overflow-x-auto"
    :class="stickyNav ? 'pt-0' : 'pt-2'"
  >
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

<style scoped>
@media (hover: none) and (pointer: coarse) {
  .stat-date-navigation {
    scrollbar-width: none;
  }

  .stat-date-navigation::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
}
</style>
