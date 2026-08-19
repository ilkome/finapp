<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/report/types'

import { statStickyTopKey } from '~/components/stat/injectionKeys'

defineProps<{
  ctx: StatReportContext
}>()

const stickyTop = inject(statStickyTopKey, ref(0))
const stickyNavigationHeight = 42
const stickySummaryGap = 12
const stickySummaryTop = computed(() => `${stickyTop.value + stickyNavigationHeight + stickySummaryGap}px`)
</script>

<template>
  <div
    v-if="ctx.shouldShowAmounts.value"
    data-stat-sticky-summary
    class="relative max-md:sticky max-md:z-10 max-md:bg-default max-md:before:absolute max-md:before:inset-x-0 max-md:before:-top-3 max-md:before:h-3 max-md:before:bg-default"
    :style="{ '--stat-sticky-summary-top': stickySummaryTop }"
  >
    <StatSumWrap
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
  </div>
</template>

<style scoped>
@media (max-width: 767px) {
  [data-stat-sticky-summary] {
    top: var(--stat-sticky-summary-top);
  }
}
</style>
