<script setup lang="ts">
import type { SplitChartSelectionState } from '~/components/stat/chart/splitChartSelection'
import type { StatReportContext } from '~/components/stat/report/types'
import type { SeriesSlug } from '~/components/stat/types'

import { resolveSplitChartSelection } from '~/components/stat/chart/splitChartSelection'
import { statCanSplitKey, statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{ contexts: Record<'combined' | 'expense' | 'income', StatReportContext> }>()
const statConfig = inject(statConfigKey)!
const canSplit = inject(statCanSplitKey, computed(() => false))
const splitChartSelection = ref<SplitChartSelectionState>({})
const combinedFilteredType = props.contexts.combined.filteredType

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
    v-if="statConfig.config.value.chart.isShow"
    class="grid min-w-0 gap-2"
    :class="statConfig.config.value.chart.isShowBackground && 'rounded-md bg-elevated/30 p-2 md:p-3'"
    data-stat-block="chart"
    data-stat-chart-section
  >
    <StatReportChart
      v-if="statConfig.config.value.chart.layout !== 'split' || !canSplit"
      :ctx="contexts.combined"
    />
    <template v-else>
      <div class="stat-two-column-grid">
        <StatReportChart :ctx="contexts.expense" @select="onSelectSplitChart('expense', $event)" />
        <StatReportChart :ctx="contexts.income" @select="onSelectSplitChart('income', $event)" />
      </div>
    </template>
    <StatDateQuickRanges
      v-if="statConfig.config.value.date.isShowQuick"
      data-stat-chart-quick-ranges
    />
  </div>
</template>
