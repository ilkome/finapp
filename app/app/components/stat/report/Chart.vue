<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/useStatReportContext'

defineProps<{
  ctx: StatReportContext
}>()
</script>

<template>
  <StatChartWrap
    v-if="ctx.shouldShowAmounts.value"
    :pieGroups="ctx.chartPieGroups.value"
    :series="ctx.chartSeries.value"
    :xAxisLabels="ctx.chartXAxisLabels.value"
    class="pb-3"
    @clickCategory="ctx.onSetCategoryFilter"
  />
</template>
