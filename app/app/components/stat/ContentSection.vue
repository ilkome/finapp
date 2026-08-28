<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/report/types'

import { statCanSplitKey, statConfigKey } from '~/components/stat/injectionKeys'

defineProps<{
  contexts: Record<'combined' | 'expense' | 'income', StatReportContext>
}>()
const statConfig = inject(statConfigKey)!
const canSplit = inject(statCanSplitKey, computed(() => false))
</script>

<template>
  <div data-stat-content-section class="grid min-w-0 gap-8">
    <template v-if="statConfig.config.value.page.layout === 'combined' || !canSplit">
      <div class="@container/stat grid min-w-0 content-start gap-3" data-stat-report-content="combined">
        <StatReportSums :ctx="contexts.combined" />
      </div>
    </template>
    <template v-else>
      <div class="stat-two-column-grid">
        <div class="@container/stat grid min-w-0 content-start gap-3" data-stat-report-content="expense">
          <StatReportSums :ctx="contexts.expense" />
        </div>
        <div class="@container/stat grid min-w-0 content-start gap-3" data-stat-report-content="income">
          <StatReportSums :ctx="contexts.income" />
        </div>
      </div>
    </template>
  </div>
</template>
