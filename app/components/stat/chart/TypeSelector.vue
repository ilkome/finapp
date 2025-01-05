<script setup lang="ts">
import type { ChartType } from '~/components/stat/chart/types'

import { useStatChart } from '~/components/stat/chart/useStatChart'

const props = defineProps<{
  chartType: ChartType
}>()

const emit = defineEmits<{
  click: [e: ChartType]
}>()

const { chartTypes } = useStatChart()
</script>

<template>
  <div class="flex">
    <StatChartButton
      v-for="item in chartTypes"
      :key="item.value"
      :isActive="props.chartType === item.value"
      @click="emit('click', item.value)"
    >
      {{ item.label }}
    </StatChartButton>
  </div>
</template>
