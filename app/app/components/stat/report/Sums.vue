<script setup lang="ts">
import type { StatSumsCtx } from '~/components/stat/report/types'
import type { StatSumRecord } from '~/components/stat/sum/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { buildStatSummaryItems } from '~/components/stat/sum/summaryItems'
import { useStatAverage } from '~/components/stat/sum/useStatAverage'

const props = defineProps<{
  ctx: StatSumsCtx
}>()

const currenciesStore = useCurrenciesStore()
const { averages, isShow: isShowAverage } = useStatAverage({
  categoryId: () => props.ctx.params.categoryId?.value,
  walletId: () => props.ctx.params.walletId?.value,
})

const config = computed(() => props.ctx.params.statConfig.config.value)
const isShowPie = computed(() => config.value.summary.isShowChart && props.ctx.effectiveChartType.value !== 'pie')

const items = computed<StatSumRecord[]>(() => buildStatSummaryItems(props.ctx.rangeTotal.value, props.ctx.filteredType.value)
  .map(item => ({ ...item, average: averages.value?.[item.type] })))

const focused = computed<StatSumRecord | null>(() => {
  if (!props.ctx.isCategoryFocus.value)
    return null
  const type = props.ctx.filteredType.value
  const total = props.ctx.rangeTotal.value
  return { amount: type === 'income' ? total.income : -total.expense, type }
})

const single = computed<StatSumRecord | null>(() => {
  const type = props.ctx.selectedTypeForSum.value
  if (type === 'summary')
    return null
  const total = props.ctx.rangeTotal.value as unknown as Record<string, number>
  return {
    amount: type === 'income' ? total.income! : -total[type]!,
    average: averages.value?.[type],
    averageByPeriod: isShowAverage.value ? props.ctx.averageTotal.value : undefined,
    type,
  }
})

function toggleAverage() {
  props.ctx.params.statConfig.updateConfig('average', { isShow: !config.value.average.isShow })
}
</script>

<template>
  <div
    v-if="ctx.shouldShowAmounts.value"
    data-stat-sticky-summary
  >
    <StatSumView
      :currencyCode="currenciesStore.base"
      :focused
      :items
      :single
      @click="ctx.onClickSumItemWrap"
      @clickAverage="toggleAverage"
    >
      <template #summaryPie="{ type }">
        <LazyStatChartPieView
          v-if="isShowPie"
          :pieData="ctx.summaryCategoryPieData.value[type]"
          :typeLabel="$t(`money.${type}`)"
        />
      </template>

      <template #focusPie>
        <LazyStatChartPieView
          v-if="isShowPie"
          :pieData="ctx.focusedCategoryPieData.value"
          :typeLabel="$t(`money.${ctx.filteredType.value}`)"
        />
      </template>
    </StatSumView>
  </div>
</template>
