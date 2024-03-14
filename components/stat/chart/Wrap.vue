<script setup lang="ts">
import { useChartStore } from '~/components/chart/useChartStore'
import type { TrnId } from '~/components/trns/types'
import type { PeriodName } from '~/components/chart/useChartStore'

withDefaults(
  defineProps<{
    trnsIds: TrnId[]
    chartType?: 'bar' | 'line'
  }>(),
  {
    chartType: 'line',
    trnsIds: () => [],
  },
)

const chartStore = useChartStore()
const periodWithoutAll = inject('periodWithoutAll') as Ref<PeriodName>

const chartType = computed(
  () => chartStore.periods[periodWithoutAll.value].type,
)
</script>

<template>
  <div class="relative mx-2 mb-4 rounded-lg bg-item-4">
    <div class="h-48">
      <StatChartView
        :chartType
        :trnsIds
      />
    </div>
    <div class="justify-between px-2 pb-2 sm_flex">
      <StatChartPeriods />
      <StatChartOptions />
    </div>
  </div>
</template>
