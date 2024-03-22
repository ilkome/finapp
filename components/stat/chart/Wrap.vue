<script setup lang="ts">
import { useChartStore } from '~/components/stat/chart/useChartStore'
import type { TrnId } from '~/components/trns/types'
import type { PeriodNameWithoutAll } from '~/components/stat/chart/useChartStore'

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
const periodNameWithoutAll = inject('periodNameWithoutAll') as Ref<PeriodNameWithoutAll>

const chartType = computed(
  () => chartStore.periods[periodNameWithoutAll.value].type,
)
</script>

<template>
  <div class="relative _rounded-lg _bg-item-4">
    <div class="h-48 bg-surface-4 border-b border-item-7">
      <StatChartView
        :chartType
        :trnsIds
      />
    </div>
    <div class="justify-between px-2 _pb-2 sm_flex bg-item-4 border-b border-item-7">
      <StatChartPeriods />
      <StatChartOptions />
    </div>
  </div>
</template>
