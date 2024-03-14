<script setup lang="ts">
import { useChart } from '~/components/chart/useChart'
import type { TrnId } from '~/components/trns/types'
import type { PeriodName } from '~/components/chart/useChart'

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

const periodWithoutAll = inject('periodWithoutAll') as Ref<PeriodName>

const { periods } = useChart()

const chartType = computed(
  () => periods.value[periodWithoutAll.value].type,
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
