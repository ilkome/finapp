<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'
import usePeriods from '~/components/periods/usePeriods'
import { getMaxPeriodsToShow } from '~/components/date/helpers'
import { getOldestTrnDate } from '~/components/trns/helpers'
import { useChart } from '~/components/chart/useChart'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const { periods, addElementsToChart, removeElementsFromChart } = useChart()
const filterStore = useFilter()
const trnsStore = useTrnsStore()

const showedPeriods = computed(() =>
  periods.value[filterStore.periodWithoutAll].showedPeriods)

function saveChartsPeriodsToLocalStorage() {
  localStorage.setItem('chartsPeriods', JSON.stringify(periods.value))
}

function addPeriod() {
  addElementsToChart()
  saveChartsPeriodsToLocalStorage()
}

function removePeriod() {
  if (showedPeriods.value <= 1)
    return

  removeElementsFromChart()
  saveChartsPeriodsToLocalStorage()
}

// Periods
const { periodsNames } = usePeriods()

// TODO: duplicate computed
const maxPeriodsNumber = computed(() => {
  const trnsItems = trnsStore.items
  const oldestTrnDate = getOldestTrnDate(trnsItems)
  return getMaxPeriodsToShow(filterStore.periodWithoutAll, oldestTrnDate)
})

const isShowRemove = computed(() => showedPeriods.value <= 1)
const isShowAdd = computed(() => showedPeriods.value >= maxPeriodsNumber.value)
</script>

<template lang="pug">
.flex-center
  .overflow-hidden.flex.items-center.text-xs
    .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-item-5(
      :class="{ 'opacity-0 cursor-default pointer-events-none': isShowRemove }"
      @click="removePeriod"
    ): .mdi.mdi-minus

    .cursor-pointer.py-2.px-3.rounded-md.hocus_bg-item-5.text-secondary2(
      v-for="periodItem in periodsNames"
      :key="periodItem.slug"
      :class="{ 'cursor-default !text-primary': periodItem.slug === filterStore.periodWithoutAll }"
      @click="filterStore.setPeriod(periodItem.slug)"
    )
      | {{ periodItem.name }}

    .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-item-5(
      :class="{ 'opacity-0 cursor-default pointer-events-none': isShowAdd }"
      @click="addPeriod"
    ): .mdi.mdi-plus
</template>
