<script setup lang="ts">
import type { LocaleSlug } from '~/components/locale/types'
import type { StatSumsCtx } from '~/components/stat/report/types'
import type { StatSumRecord } from '~/components/stat/sum/types'
import type { SeriesSlugSelected } from '~/components/stat/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { SUMMARY_TOTAL_WIDE_QUERY } from '~/components/stat/config/schema'
import { statDateRangeLabel } from '~/components/stat/date/rangeLabelText'
import { statInSheetKey } from '~/components/stat/injectionKeys'
import { buildStatSummaryItems } from '~/components/stat/sum/summaryItems'
import { useStatAverage } from '~/components/stat/sum/useStatAverage'

const props = defineProps<{
  ctx: StatSumsCtx
}>()

const { locale, t } = useI18n()
const currenciesStore = useCurrenciesStore()
const isInSheet = inject(statInSheetKey, false)
const { averages, isShow: isShowAverage } = useStatAverage({
  categoryId: () => props.ctx.params.categoryId?.value,
  walletId: () => props.ctx.params.walletId?.value,
})

const config = computed(() => props.ctx.params.statConfig.config.value)
const isWide = useMediaQuery(SUMMARY_TOTAL_WIDE_QUERY)
const isShowTotal = computed(() => config.value.summary.isShowTotal ?? isWide.value)
// No pie data (a single-color pie is hidden, a lone category) leaves no empty slot either.
const hasPieData = computed(() => {
  const data = props.ctx.summaryCategoryPieData.value
  if (props.ctx.selectedTypeForSum.value !== 'summary')
    return (data[props.ctx.selectedTypeForSum.value as 'expense' | 'income']?.length ?? 0) > 0
  if (props.ctx.isCategoryFocus.value)
    return props.ctx.focusedCategoryPieData.value.length > 0
  return data.expense.length > 0 || data.income.length > 0
})
const isShowPie = computed(() => config.value.summary.isShowChart && props.ctx.effectiveChartType.value !== 'pie' && hasPieData.value)

const items = computed<StatSumRecord[]>(() => buildStatSummaryItems(props.ctx.rangeTotal.value, props.ctx.filteredType.value)
  .filter(item => item.type !== 'net' || isShowTotal.value)
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
  const amount = type === 'income' ? total.income! : -total[type]!
  if (isInSheet)
    return sheetRecord(type, amount)
  return {
    amount,
    average: averages.value?.[type],
    averageByPeriod: isShowAverage.value ? props.ctx.averageTotal.value : undefined,
    type,
  }
})

/** A sheet names the span of its sum and averages it over every period the chart shows. */
function sheetRecord(type: SeriesSlugSelected, amount: number): StatSumRecord {
  const statDate = props.ctx.params.statDate
  const { granularityBy, granularityDuration } = statDate.params.value
  const span = statDateRangeLabel({
    intervalsInRange: statDate.intervalsInRange.value,
    params: statDate.params.value,
    range: statDate.range.value,
  }, t, locale.value as LocaleSlug)
  const full = props.ctx.fullRangeTotal.value as unknown as Record<string, number>
  const fullAmount = type === 'income' ? full.income! : -full[type]!
  return {
    amount,
    average: fullAmount / Math.max(1, statDate.intervalsInRange.value.length),
    averageLabel: granularityDuration === 1
      ? t(`stat.average.per.${granularityBy}`)
      : `${t('stat.average.perMany')} ${granularityDuration} ${t(`dates.${granularityBy}.plural`, granularityDuration)}`,
    title: `${t('stat.sum.for')} ${span.toLocaleLowerCase(locale.value)}`,
    type,
  }
}

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
      :isShowPie
      :isShowPieOnNarrow="!isShowTotal"
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
