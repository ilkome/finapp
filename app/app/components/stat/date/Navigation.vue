<script setup lang="ts">
import {
  isEnd as computeIsEnd,
  isShowNav as computeIsShowNav,
  isShowNavHome as computeIsShowNavHome,
  isStart as computeIsStart,
  isLatestSelectedInterval,
} from '~/components/stat/date/navigationPredicates'
import { statDateKey } from '~/components/stat/injectionKeys'

const props = withDefaults(defineProps<{
  isShowButtons?: boolean
}>(), {
  isShowButtons: true,
})
const statDate = inject(statDateKey)!

const isShowNav = computed(() => computeIsShowNav(statDate.params.value, statDate.range.value, statDate.maxRange.value, new Date()))

const isIntervalStep = computed(() => statDate.params.value.intervalSelected !== -1)

// The window the arrows actually move, and the unit they move it by.
const navRange = computed(() => (isIntervalStep.value && statDate.selectedInterval.value) || statDate.range.value)
const navBy = computed(() => (isIntervalStep.value ? statDate.params.value.granularityBy : statDate.params.value.rangeBy))
const navDuration = computed(() => (isIntervalStep.value ? statDate.params.value.granularityDuration : statDate.params.value.rangeDuration))

const isEnd = computed(() => {
  const now = new Date()
  return (
    isLatestSelectedInterval(statDate.params.value.intervalSelected, statDate.intervalsInRange.value.length, statDate.range.value, now)
    || computeIsEnd(statDate.params.value, navRange.value, now, navBy.value, navDuration.value)
  )
})

const isStart = computed(() => computeIsStart(navRange.value, statDate.maxRange.value))

const isShowNavHome = computed(() => computeIsShowNavHome(statDate.params.value, statDate.range.value, new Date()))

function changeDate(way: 'next' | 'prev' | 'today') {
  if (way === 'today') {
    statDate.goHome()
    return
  }

  if (way === 'next' ? isEnd.value : isStart.value)
    return

  const direction = way === 'next' ? 1 : -1
  // An interval is selected -> the arrows step intervals (days inside a month, months
  // inside a year) and roll into the neighbouring range at the edges.
  if (statDate.params.value.intervalSelected !== -1)
    statDate.stepInterval(direction)
  else statDate.stepRange(direction)
}
</script>

<template>
  <div
    class="stat-date-navigation -mx-2 flex grow snap-x snap-mandatory scroll-px-2 items-center gap-2 overflow-x-auto px-2 md:mx-0 md:scroll-px-0 md:px-0"
  >
    <UiNavArrows
      v-if="props.isShowButtons && isShowNav && !statDate.params.value.customDate"
      class="shrink-0 snap-start"
      hideInactiveArrows
      :homeAriaLabel="$t('base.reset')"
      homeMatchesArrows
      :isEnd
      :isShowNavHome
      :isStart
      @changeDate="changeDate"
    >
      <StatDateRangeButton class="snap-start" />
    </UiNavArrows>

    <StatDateRangeButton v-else class="shrink-0 snap-start" />

    <slot />
  </div>
</template>

<style scoped>
.stat-date-navigation {
  scrollbar-width: none;
}

.stat-date-navigation::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}
</style>
