<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/useStatReportContext'

defineProps<{
  ctx: StatReportContext
}>()
</script>

<template>
  <StatSumWrap
    v-if="ctx.shouldShowAmounts.value"
    :averageTotal="ctx.averageTotal.value"
    :categoryId="ctx.params.categoryId?.value"
    :filteredType="ctx.filteredType.value"
    :forecastMode="ctx.forecastMode.value"
    :forecastTotal="ctx.forecastRangeTotal.value"
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
        :pieData="ctx.summaryCategoryPieData.value[type]"
        :typeLabel="$t(`money.${type}`)"
      />
    </template>

    <template #focusPie>
      <LazyStatChartPieView
        v-if="ctx.isCategoryFocus.value"
        :pieData="ctx.focusedCategoryPieData.value"
        :typeLabel="$t(`money.${ctx.filteredType.value}`)"
      />
    </template>
  </StatSumWrap>
</template>
