<script setup lang="ts">
import type { StatReportContexts } from '~/components/stat/report/types'

defineProps<{
  contexts: StatReportContexts
}>()
</script>

<template>
  <div data-stat-content-section class="grid min-w-0 gap-8">
    <template v-if="!contexts.isPageSplit || !contexts.split">
      <div class="@container/stat grid min-w-0 content-start gap-2" data-stat-report-content="combined">
        <StatReportSums :ctx="contexts.combined" />
      </div>
    </template>
    <template v-else>
      <div class="stat-two-column-grid">
        <div class="@container/stat grid min-w-0 content-start gap-2" data-stat-report-content="expense">
          <StatReportSums :ctx="contexts.split.expense" />
        </div>
        <div class="@container/stat grid min-w-0 content-start gap-2" data-stat-report-content="income">
          <StatReportSums :ctx="contexts.split.income" />
        </div>
      </div>
    </template>
  </div>
</template>
