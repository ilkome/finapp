<script setup lang="ts">
import type { SplitChartSelectionState } from '~/components/stat/chart/splitChartSelection'
import type { StatReportContexts } from '~/components/stat/report/types'
import type { SeriesSlug } from '~/components/stat/types'

import { resolveSplitChartSelection } from '~/components/stat/chart/splitChartSelection'
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'

const props = defineProps<{ contexts: StatReportContexts }>()
const statConfig = useStatConfigCtx()
const splitChartSelection = ref<SplitChartSelectionState>({})
const combinedFilteredType = props.contexts.combined.filteredType
const isSplit = computed(() => props.contexts.isChartSplit)
// Split charts are two blocks, not one split in half, so each carries its own background.
const backgroundClass = computed(() => statConfig.chart.value.isShowBackground
  ? 'rounded-md bg-elevated/30 p-2 md:p-3'
  : undefined)

function onSelectSplitChart(type: SeriesSlug, intervalKey?: number) {
  const result = resolveSplitChartSelection(
    combinedFilteredType.value,
    type,
    intervalKey,
    splitChartSelection.value,
  )
  combinedFilteredType.value = result.nextType
  splitChartSelection.value = result.state
}
</script>

<template>
  <div
    v-if="statConfig.chart.value.isShow"
    class="grid min-w-0 gap-2"
    :class="!isSplit && backgroundClass"
    data-stat-block="chart"
    data-stat-chart-section
  >
    <StatReportChart
      v-if="!isSplit"
      :ctx="contexts.combined"
    />
    <template v-else-if="contexts.split">
      <div class="stat-two-column-grid">
        <div class="grid min-w-0" :class="backgroundClass">
          <StatReportChart :ctx="contexts.split.expense" @select="onSelectSplitChart('expense', $event)" />
        </div>
        <div class="grid min-w-0" :class="backgroundClass">
          <StatReportChart :ctx="contexts.split.income" @select="onSelectSplitChart('income', $event)" />
        </div>
      </div>
    </template>
    <StatDateQuickRanges
      v-if="statConfig.date.value.isShowQuick"
      data-stat-chart-quick-ranges
    />
  </div>
</template>
