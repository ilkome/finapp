<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/report/types'

defineProps<{
  ctx: StatReportContext
}>()
</script>

<template>
  <div
    v-if="ctx.shouldShowAmounts.value"
    data-stat-sticky-summary
  >
    <StatSumWrap
      :averageTotal="ctx.averageTotal.value"
      :categoryId="ctx.params.categoryId?.value"
      :filteredType="ctx.filteredType.value"
      :focusedType="ctx.isCategoryFocus.value ? ctx.filteredType.value : undefined"
      :total="ctx.rangeTotal.value"
      :trnsIds="ctx.params.trnsIds.value"
      :type="ctx.selectedTypeForSum.value"
      :walletId="ctx.params.walletId?.value"
      @click="ctx.onClickSumItemWrap"
      @clickAverage="ctx.params.statConfig.updateConfig('average', { isShow: !ctx.params.statConfig.config.value.average.isShow })"
    >
      <template #summaryPie="{ type }">
        <LazyStatChartPieView
          v-if="ctx.params.statConfig.config.value.summary.isShowChart && ctx.effectiveChartType.value !== 'pie'"
          :pieData="ctx.summaryCategoryPieData.value[type]"
          :typeLabel="$t(`money.${type}`)"
        />
      </template>

      <template #focusPie>
        <LazyStatChartPieView
          v-if="ctx.isCategoryFocus.value && ctx.params.statConfig.config.value.summary.isShowChart && ctx.effectiveChartType.value !== 'pie'"
          :pieData="ctx.focusedCategoryPieData.value"
          :typeLabel="$t(`money.${ctx.filteredType.value}`)"
        />
      </template>
    </StatSumWrap>
  </div>
</template>
