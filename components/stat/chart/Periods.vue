<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'
import usePeriods from '~/components/periods/usePeriods'
import { getMaxPeriodsToShow } from '~/components/date/helpers'
import { getOldestTrnDate } from '~/components/trns/helpers'
import { useChart } from '~/components/chart/useChart'
import type { PeriodName, PeriodNameWithAll } from '~/components/chart/useChart'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const props = defineProps<{
  periodWithoutAll: PeriodName
}>()

const emit = defineEmits<{
  setPeriodAndDate: [period: PeriodName]
}>()

const { periods, addElementsToChart, removeElementsFromChart } = useChart()
const filterStore = useFilter()
const trnsStore = useTrnsStore()

const showedPeriods = computed(
  () => periods.value[props.periodWithoutAll].showedPeriods,
)

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

<template>
  <div class="flex-center">
    <div class="flex items-center overflow-hidden text-xs">
      <div
        class="flex-center w-10 cursor-pointer rounded-md px-3 py-2 hocus_bg-item-5"
        :class="{
          'pointer-events-none cursor-default opacity-0': isShowRemove,
        }"
        @click="removePeriod"
      >
        <i class="mdi mdi-minus" />
      </div>

      <div
        v-for="periodItem in periodsNames"
        :key="periodItem.slug"
        class="cursor-pointer rounded-md px-3 py-2 text-secondary2 hocus_bg-item-5"
        :class="{
          'cursor-default !text-primary':
            periodItem.slug === periodWithoutAll,
        }"
        @click="emit('setPeriodAndDate', periodItem.slug)"
      >
        {{ periodItem.name }}
      </div>

      <div
        class="flex-center w-10 cursor-pointer rounded-md px-3 py-2 hocus_bg-item-5"
        :class="{ 'pointer-events-none cursor-default opacity-0': isShowAdd }"
        @click="addPeriod"
      >
        <i class="mdi mdi-plus" />
      </div>
    </div>
  </div>
</template>
