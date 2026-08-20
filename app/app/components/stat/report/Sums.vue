<script setup lang="ts">
import type { StatReportContext } from '~/components/stat/report/types'

import { statStickyNavigationHeightKey, statStickyTopKey } from '~/components/stat/injectionKeys'

defineProps<{
  ctx: StatReportContext
}>()

const stickyTop = inject(statStickyTopKey, ref(0))
const stickyNavigationHeight = inject(statStickyNavigationHeightKey, ref(42))
const stickySummaryGap = 6
const stickySummaryTop = computed(() => `${stickyTop.value + stickyNavigationHeight.value + stickySummaryGap}px`)
</script>

<template>
  <div
    v-if="ctx.shouldShowAmounts.value"
    data-stat-sticky-summary
    class="sticky z-10 bg-default/90 backdrop-blur before:absolute before:inset-x-0 before:-top-1.5 before:h-1.5 before:bg-default/90 before:backdrop-blur"
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
[data-stat-sticky-summary] {
  top: var(--stat-sticky-summary-top);
}
</style>
