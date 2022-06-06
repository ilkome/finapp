<script setup lang="ts">
import useFilter from '~/components/filter/useFilter'
import usePeriods from '~/components/periods/usePeriods'
import { getMaxPeriodsToShow } from '~/components/date/helpers'
import { getOldestTrnDate } from '~/components/trns/helpers'

const { $store } = useNuxtApp()

// Filter
const { filterPeriodNameAllReplacedToYear } = useFilter()

const showedPeriods = computed(() =>
  $store.state.chart.periods[filterPeriodNameAllReplacedToYear.value].showedPeriods)

function saveChartsPeriodsToLocalStorage() {
  $store.dispatch('ui/saveUiView')
}

function addPeriod() {
  $store.commit('chart/addElementsToChart', {
    periodName: filterPeriodNameAllReplacedToYear.value,
    periodType: 'showedPeriods',
  })
  saveChartsPeriodsToLocalStorage()
}

function removePeriod() {
  if (showedPeriods.value <= 1)
    return

  $store.commit('chart/removeElementsFromChart', {
    periodName: filterPeriodNameAllReplacedToYear.value,
    periodType: 'showedPeriods',
  })
  saveChartsPeriodsToLocalStorage()
}

// Periods
const { periodsNames } = usePeriods()

// TODO: duplicate computed
const maxPeriodsNumber = computed(() => {
  const trnsItems = $store.state.trns.items
  const oldestTrnDate = getOldestTrnDate(trnsItems)
  return getMaxPeriodsToShow(filterPeriodNameAllReplacedToYear.value, oldestTrnDate)
})

const isShowRemove = computed(() => showedPeriods.value <= 1)
const isShowAdd = computed(() => showedPeriods.value >= maxPeriodsNumber.value)
</script>

<template lang="pug">
.flex-center
  .overflow-hidden.flex.items-center.text-xs
    .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
      :class="{ 'opacity-0 cursor-default pointer-events-none': isShowRemove }"
      @click="removePeriod"
    ): .mdi.mdi-minus

    .cursor-pointer.py-2.px-3.rounded-md.hocus_bg-skin-item-main-hover(
      v-for="periodItem in periodsNames"
      :key="periodItem.slug"
      :class="{ 'cursor-default text-skin-item-base-up': periodItem.slug === filterPeriodNameAllReplacedToYear }"
      @click="$store.dispatch('filter/setPeriod', periodItem.slug)"
    )
      | {{ periodItem.name }}

    .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
      :class="{ 'opacity-0 cursor-default pointer-events-none': isShowAdd }"
      @click="addPeriod"
    ): .mdi.mdi-plus
</template>
