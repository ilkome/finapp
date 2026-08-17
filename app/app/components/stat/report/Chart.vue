<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/report/types'

defineProps<{
  ctx: StatReportContext
}>()
</script>

<template>
  <StatChartWrap
    v-if="ctx.shouldShowAmounts.value"
    :series="ctx.chartSeries.value"
    :chartWindow="ctx.chartWindow"
    :xAxisLabels="ctx.chartXAxisLabels.value"
    class="pb-3"
  />
</template>
