<script setup lang="ts">
import { useFilter } from '~/components/filter/useFilter'
import { getMaxPeriodsToShow } from '~/components/date/helpers'
import { useChartStore } from '~/components/stat/chart/useChartStore'
import type { PeriodNameWithAll, PeriodNameWithoutAll } from '~/components/stat/chart/useChartStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

const periodNameWithoutAll = inject('periodNameWithoutAll') as Ref<PeriodNameWithoutAll>
const setPeriodAndDate = inject('setPeriodAndDate') as (period: PeriodNameWithAll) => void

const chartStore = useChartStore()
const filterStore = useFilter()
const trnsStore = useTrnsStore()

const showedPeriods = computed(
  () => chartStore.periods[periodNameWithoutAll.value].showedPeriods,
)

function saveChartsPeriodsToLocalStorage() {
  localStorage.setItem('chartsPeriods', JSON.stringify(chartStore.periods))
}

function addPeriod() {
  chartStore.addPeriod()
  saveChartsPeriodsToLocalStorage()
}

function removePeriod() {
  if (showedPeriods.value <= 1)
    return

  chartStore.removePeriod()
  saveChartsPeriodsToLocalStorage()
}

// TODO: duplicate computed
const maxPeriodsNumber = computed(() => getMaxPeriodsToShow(filterStore.periodNameWithoutAll, trnsStore.oldestTrnDate))
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
        v-for="periodItem in chartStore.periodsNames"
        :key="periodItem.slug"
        class="cursor-pointer rounded-md px-3 py-2 text-secondary2 hocus_bg-item-5"
        :class="{
          'cursor-default !text-primary':
            periodItem.slug === periodNameWithoutAll,
        }"
        @click="setPeriodAndDate(periodItem.slug)"
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
