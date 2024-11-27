<script setup lang="ts">
import type { ChartType } from '~/components/stat/chart/types'

const chartType = defineModel<ChartType>('chartType', {
  default: 'bar',
})

const { t } = useI18n()

const items = computed<{ label: string, value: ChartType }[]>(() => [{
  label: t('chart.types.bar'),
  value: 'bar',
}, {
  label: t('chart.types.line'),
  value: 'line',
}])
</script>

<template>
  <div class="flex gap-0">
    <StatChartButton
      v-for="item in items"
      :key="item.value"
      :isActive="chartType === item.value"
      @click="chartType = item.value"
    >
      {{ item.label }}
    </StatChartButton>
  </div>
</template>
