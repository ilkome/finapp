<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/report/types'
import type { SeriesSlug } from '~/components/stat/types'
import type { SplitChartSelectionState } from '~/components/stat/chart/splitChartSelection'

import { resolveSplitChartSelection } from '~/components/stat/chart/splitChartSelection'
import { statCanSplitKey, statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{ contexts: Record<'combined' | 'expense' | 'income', StatReportContext> }>()
const statConfig = inject(statConfigKey)!
const canSplit = inject(statCanSplitKey, computed(() => false))
const splitChartSelection = ref<SplitChartSelectionState>({})

function onSelectSplitChart(type: SeriesSlug, intervalKey?: number) {
  const result = resolveSplitChartSelection(
    props.contexts.combined.filteredType.value,
    type,
    intervalKey,
    splitChartSelection.value,
  )
  props.contexts.combined.filteredType.value = result.nextType
  splitChartSelection.value = result.state
}
</script>

<template>
  <div
    v-if="statConfig.config.value.chart.isShow"
    class="grid min-w-0 gap-8"
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
  </div>
</template>
