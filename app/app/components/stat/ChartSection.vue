<script setup lang="ts">
import type { SplitChartSelectionState } from '~/components/stat/chart/splitChartSelection'
import type { StatReportContexts } from '~/components/stat/report/types'
import type { SeriesSlug } from '~/components/stat/types'

import { resolveSplitChartSelection } from '~/components/stat/chart/splitChartSelection'
import { useStatConfigCtx } from '~/components/stat/config/useStatConfigCtx'
import { statDateKey } from '~/components/stat/injectionKeys'

const props = defineProps<{ contexts: StatReportContexts }>()
const statConfig = useStatConfigCtx()
const statDate = inject(statDateKey)!
const quickRangeIds = computed(() => {
  const selected = new Set(statConfig.date.value.quickRangeIds)
  return statConfig.date.value.quickRangeOrderIds.filter(id => selected.has(id))
})
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
    <div
      v-if="statConfig.date.value.isShowQuick"
      class="-mx-2 scroll-strip flex min-w-0 snap-x snap-mandatory scroll-px-2 items-center overflow-x-auto px-2 py-px lg:-mx-4 lg:scroll-px-4 lg:px-4 2xl:-mx-8 2xl:scroll-px-8 2xl:px-8"
      data-stat-chart-quick-ranges
    >
      <StatDateRanges
        class="shrink-0"
        itemClass="snap-start snap-always"
        size="xs"
        :optionIds="quickRangeIds"
        :statDate
        tabsClass="overflow-visible! bg-transparent! p-0!"
        view="all"
      />
    </div>
  </div>
</template>
