<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/report/types'

defineProps<{
  ctx: StatReportContext
}>()

defineEmits<{
  select: [intervalKey?: number]
}>()
</script>

<template>
  <StatChartWrap
    v-if="ctx.shouldShowAmounts.value"
    :series="ctx.chartSeries.value"
    :chartWindow="ctx.chartWindow"
    :chartType="ctx.effectiveChartType.value"
    :xAxisLabels="ctx.chartXAxisLabels.value"
    class="min-w-0"
    @select="$emit('select', $event)"
  />
</template>
