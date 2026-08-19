<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/report/types'

import { statCanSplitKey, statConfigKey } from '~/components/stat/injectionKeys'

defineProps<{ contexts: Record<'combined' | 'expense' | 'income', StatReportContext> }>()
const statConfig = inject(statConfigKey)!
const canSplit = inject(statCanSplitKey, computed(() => false))
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
      <div class="grid min-w-0 grid-cols-2 gap-8">
        <StatReportChart :ctx="contexts.expense" />
        <StatReportChart :ctx="contexts.income" />
      </div>
    </template>
  </div>
</template>
