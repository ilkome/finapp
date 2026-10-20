<script setup lang="ts">
import { sum } from 'es-toolkit'

import type { SummaryTile } from '~/components/wallets/analytics/SummaryTilesView.vue'
import type { AnalyticsBase } from '~/components/wallets/analytics/useAnalyticsBase'

import { getTotal } from '~/components/amount/getTotal'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { balanceSeries, periodChange, splitOpening } from '~/components/wallets/analytics/balanceHistory'
import { cashflowPoints } from '~/components/wallets/analytics/cashflow'
import { MONTH_MS } from '~/components/wallets/analytics/stats'
import { formatPercent, savingsRate } from '~/components/wallets/analytics/tooltips'
import { useSharedForecast } from '~/components/wallets/analytics/useForecast'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  base: AnalyticsBase
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const { forecast, incomeOutsideWalletIds, runwayOf, today } = useSharedForecast()

const total = computed(() => splitOpening(balanceSeries({
  balances: props.base.pointBalances.value,
  breakdown: 'total',
  scope: 'net',
  toBaseAt: props.base.toBaseAtPoint,
  walletIds: props.base.walletIds.value,
  wallets: walletsStore.items ?? {},
}))[0])

const flows = computed(() => {
  const points = cashflowPoints({
    computeTotal: (ids, index) => getTotal({
      excludedCategoriesIds: categoriesStore.excludedFromStatsIds,
      toBase: props.base.tryToBaseAt(index),
      trnsIds: ids,
      trnsItems: trnsStore.items ?? {},
      walletsItems: walletsStore.items ?? {},
    }),
    intervals: props.base.intervals.value,
    trnsIds: trnsStore.getStoreTrnsIds({ dates: props.base.range.value, walletsIds: props.base.walletIds.value }),
    trnsItems: trnsStore.items ?? {},
  })
  return { income: sum(points.income), net: sum(points.net) }
})

// Months of safety is the forecast's runway without income: one number for the page.
const safety = computed(() => {
  const runway = forecast.value.runwayWithoutIncome
  if (runway === null)
    return { caption: t('wallets.analytics.kpi.beyondHorizon'), text: t('wallets.analytics.forecast.enough') }
  // Income landing outside the forecast's wallets is the usual reason for a short runway; point at the hint.
  const outside = incomeOutsideWalletIds.value.length
    ? { caption: t('wallets.analytics.kpi.incomeOutside'), captionTo: { hash: '#analytics-forecast', query: { tab: 'forecast' } }, isWarning: true }
    : {}
  if (runway <= today.value)
    return { ...outside, text: t('wallets.analytics.forecast.runOut') }
  const months = (runway - today.value) / MONTH_MS
  return { caption: runwayOf(runway).dateLabel ?? undefined, ...outside, text: `${Math.round(months * 10) / 10}` }
})

const tiles = computed<SummaryTile[]>(() => [
  { amount: total.value?.data.at(-1) ?? 0, id: 'netWorth', label: t('wallets.analytics.balance.net') },
  { amount: total.value ? periodChange(total.value) : 0, id: 'change', isShowPlus: true, label: t('wallets.analytics.kpi.change') },
  { id: 'savingsRate', label: t('wallets.analytics.cashflow.savingsRateTitle'), text: formatPercent(savingsRate(flows.value.net, flows.value.income)) },
  { ...safety.value, id: 'safety', label: t('wallets.analytics.kpi.safety'), text: safety.value.text },
])
</script>

<template>
  <section class="min-w-0 @3xl/page:col-span-2" data-analytics-kpi>
    <WalletsAnalyticsSummaryTilesView :currencyCode="currenciesStore.base" :columns="4" :items="tiles" />
  </section>
</template>
