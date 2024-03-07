<script setup lang="ts">
import { useChart } from '~/components/chart/useChart'
import type { TrnId } from '~/components/trns/types'
import type { PeriodName, PeriodNameWithAll } from '~/components/chart/useChart'

const props = withDefaults(
  defineProps<{
    trnsIds: TrnId[]
    chartType?: 'bar' | 'line'
    periodWithoutAll: PeriodName
  }>(),
  {
    chartType: 'line',
    trnsIds: () => [],
  },
)

const emit = defineEmits<{
  setDate: [value: number]
  setPeriodAndDate: [period: PeriodName]
}>()

const { periods } = useChart()

const chartType = computed(
  () => periods.value[props.periodWithoutAll].type,
)
</script>

<template>
  <div class="mx-2 mb-4 rounded-lg bg-item-4">
    <div class="h-48">
      <StatChartView2
        :chartType
        :trnsIds
        :periodWithoutAll
        @setDate="v => emit('setDate', v)"
      />
    </div>
    <div class="justify-between px-2 pb-2 sm_flex">
      <StatChartPeriods
        :periodWithoutAll
        @setPeriodAndDate="v => emit('setPeriodAndDate', v)"
      />
      <StatChartOptions />
    </div>
  </div>
</template>
