<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { formatByLocale } from '~~/utils/date/civil'

import type { AxisChartType } from '~/components/stat/chart/types'
import type { ChartSeries } from '~/components/stat/types'
import type { BalanceBreakdown, BalanceScope } from '~/components/wallets/analytics/balanceHistory'
import type { AnalyticsLegendItem } from '~/components/wallets/analytics/LegendView.vue'
import type { AnalyticsOption } from '~/components/wallets/analytics/SettingsMenu.vue'
import type { SummaryTile } from '~/components/wallets/analytics/SummaryTilesView.vue'
import type { AnalyticsBase } from '~/components/wallets/analytics/useAnalyticsBase'

import { formatAmount, minorToAmount } from '~/components/amount/utils'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { defaultConfig } from '~/components/stat/config/schema'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { balanceExtremes, balanceSeries, changeSeries, OTHER_SERIES_ID, periodChange, splitOpening } from '~/components/wallets/analytics/balanceHistory'
import { toChartSeries } from '~/components/wallets/analytics/chartSeries'
import { balanceTooltipRows } from '~/components/wallets/analytics/tooltips'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { isCreditProduct } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  base: AnalyticsBase
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const dateLocale = useDateLocale()

const options = useStorage(WALLET_STORAGE_KEYS.analyticsBalance, {
  breakdown: 'total' as BalanceBreakdown,
  chartType: 'line' as AxisChartType,
  hidden: [] as string[],
  scope: 'net' as BalanceScope,
}, localStorage, { mergeDefaults: true })

const series = computed(() => splitOpening(balanceSeries({
  balances: props.base.pointBalances.value,
  breakdown: options.value.breakdown,
  scope: options.value.scope,
  toBaseAt: props.base.toBaseAtPoint,
  walletIds: props.base.walletIds.value,
  wallets: walletsStore.items ?? {},
})))

function nameOf(id: string, name?: string) {
  if (name)
    return name
  if (id === 'total')
    return t(options.value.scope === 'net' ? 'wallets.analytics.balance.net' : 'money.types.total')
  if (id === OTHER_SERIES_ID)
    return t('wallets.analytics.other')
  return options.value.breakdown === 'type' ? t(`money.types.${id}`) : id
}

const hidden = computed(() => new Set(options.value.hidden))
const tooltipRows = computed(() => balanceTooltipRows({
  changeLabel: t('wallets.analytics.balance.change'),
  currencyCode: currenciesStore.base,
  series: series.value
    .filter(item => !hidden.value.has(item.id))
    .map(item => ({ ...item, name: nameOf(item.id, item.name) })),
  total: options.value.breakdown === 'total' ? undefined : { color: 'var(--ui-text-highlighted)', name: t('money.types.total') },
}))

const scopeWalletIds = computed(() => props.base.walletIds.value.filter(id => options.value.scope === 'net' || !isCreditProduct(walletsStore.items?.[id]?.type)))

// Days are priced by the rates of their interval (the opening ones before the range): one rate set per interval.
function toBaseOn(date: number) {
  if (props.base.ratesMode.value === 'current')
    return currenciesStore.toBase
  return props.base.toBaseAt(date < props.base.range.value.start ? -1 : props.base.intervals.value.findIndex(interval => date <= interval.end))
}

const extremes = computed(() => balanceExtremes({
  rangeEnd: props.base.range.value.end,
  rangeStart: props.base.range.value.start,
  toBaseOn,
  trnsItems: trnsStore.items ?? {},
  walletIds: scopeWalletIds.value,
  wallets: walletsStore.items ?? {},
}))

const summary = computed<SummaryTile[]>(() => {
  const { ath, max, min } = extremes.value
  const dateOf = (date: number) => formatByLocale(date, 'd MMM yyyy', dateLocale.value)
  const now = series.value.reduce((sum, item) => sum + (item.data.at(-1) ?? 0), 0)
  return [
    ...(min ? [{ amount: min.value, caption: dateOf(min.date), id: 'min', label: t('wallets.analytics.balance.min') }] : []),
    ...(max ? [{ amount: max.value, caption: dateOf(max.date), id: 'max', label: t('wallets.analytics.balance.max') }] : []),
    ...(ath
      ? [{
          amount: ath.value,
          caption: now < ath.value ? `${dateOf(ath.date)} · ${t('wallets.analytics.balance.belowAth')} ${formatAmount(ath.value - now, currenciesStore.base)}` : dateOf(ath.date),
          id: 'ath',
          label: t('wallets.analytics.balance.ath'),
        }]
      : []),
  ]
})

/** All-time high marked on the chart when it falls inside the range. */
const athMarkPoint = computed(() => {
  const { ath } = extremes.value
  const index = ath && ath.date >= props.base.range.value.start ? props.base.intervals.value.findIndex(interval => ath.date <= interval.end) : -1
  if (index < 0 || options.value.breakdown !== 'total')
    return undefined
  return {
    data: [{ coord: [index, minorToAmount(series.value[0]?.data[index] ?? 0, currenciesStore.base)], name: 'ath' }],
    label: { show: false },
    symbol: 'pin',
    symbolSize: 18,
  }
})

const chartSeries = computed<ChartSeries[]>(() => series.value
  .filter(item => !hidden.value.has(item.id))
  .map((item, index) => ({ color: item.color, data: item.data, markPoint: index ? undefined : athMarkPoint.value, name: nameOf(item.id, item.name), type: options.value.chartType })))

/** Change per interval: up and down bars for the total, the breakdown's own colours otherwise. */
const changeChartSeries = computed<ChartSeries[]>(() => {
  const changes = changeSeries(series.value.filter(item => !hidden.value.has(item.id)))
  if (options.value.breakdown !== 'total')
    return changes.map(item => ({ color: item.color, data: item.data, name: nameOf(item.id, item.name), type: 'bar' as const }))
  const data = changes[0]?.data ?? []
  return [
    { color: 'var(--color-income-1)', data: data.map(value => Math.max(0, value)), name: t('wallets.analytics.balance.up'), type: 'bar' as const },
    { color: 'var(--color-expense-1)', data: data.map(value => Math.min(0, value)), name: t('wallets.analytics.balance.down'), type: 'bar' as const },
  ]
})
const changeChartConfig = computed(() => ({ ...defaultConfig.chart, isGrouped: true, isShowScale: true, type: 'bar' as const }))

const legend = computed<AnalyticsLegendItem[]>(() => series.value.map(item => ({
  color: item.color ?? 'var(--ui-text-muted)',
  id: item.id,
  isHidden: hidden.value.has(item.id),
  name: nameOf(item.id, item.name),
  secondLabel: t('wallets.analytics.balance.change'),
  secondValue: periodChange(item),
  value: item.data.at(-1) ?? 0,
})))

function toggle(id: string) {
  options.value.hidden = hidden.value.has(id) ? options.value.hidden.filter(item => item !== id) : [...options.value.hidden, id]
}

// A stacked area keeps a breakdown readable as parts of the total; a single total stays a plain line.
const chartConfig = computed(() => ({
  ...defaultConfig.chart,
  isGrouped: true,
  isShowScale: true,
  line: { ...defaultConfig.chart.line, isGradient: options.value.breakdown !== 'total', isShowPoints: false },
  type: options.value.chartType,
}))

const settings = computed<AnalyticsOption[]>(() => [
  {
    id: 'breakdown',
    items: (['total', 'type', 'currency', 'wallet'] as const).map(value => ({ label: t(`wallets.analytics.breakdown.${value}`), value })),
    label: t('wallets.analytics.breakdown.label'),
    value: options.value.breakdown,
  },
  {
    id: 'scope',
    items: (['net', 'assets'] as const).map(value => ({ label: t(`wallets.analytics.scope.${value}`), value })),
    label: t('wallets.analytics.scope.label'),
    value: options.value.scope,
  },
  {
    id: 'chartType',
    items: (['line', 'bar'] as const).map(value => ({ label: t(`wallets.analytics.chartType.${value}`), value })),
    label: t('wallets.analytics.chartType.label'),
    value: options.value.chartType,
  },
])

function onSetting(id: string, value: number | string) {
  options.value = { ...options.value, hidden: id === 'breakdown' ? [] : options.value.hidden, [id]: value }
}
</script>

<template>
  <section class="grid min-w-0 content-start gap-3" data-analytics-balance>
    <div class="flex items-center gap-2">
      <UiTitleSection class="grow">
        {{ t('wallets.analytics.balance.title') }}
      </UiTitleSection>
      <WalletsAnalyticsSettingsMenu
        :options="settings"
        :title="t('wallets.analytics.balance.title')"
        @change="onSetting"
      />
    </div>

    <div class="min-h-44 min-w-0">
      <LazyStatChartAxisView
        isTooltipOnTap
        scaleMode="fit"
        :chartConfig
        :chartType="options.chartType"
        :period="props.base.effectivePeriod.value"
        :series="toChartSeries(chartSeries, currenciesStore.base)"
        :tooltipRows
        :xAxisLabels="props.base.xAxisLabels.value"
      />
    </div>

    <div class="min-h-28 min-w-0">
      <UiText variant="caption" class="px-2">
        {{ t('wallets.analytics.balance.changePerInterval') }}
      </UiText>
      <LazyStatChartAxisView
        isTooltipOnTap
        :chartConfig="changeChartConfig"
        chartType="bar"
        :period="props.base.effectivePeriod.value"
        :series="toChartSeries(changeChartSeries, currenciesStore.base)"
        :xAxisLabels="props.base.xAxisLabels.value"
      />
    </div>

    <WalletsAnalyticsLegendView
      :currencyCode="currenciesStore.base"
      :items="legend"
      :isToggleable="legend.length > 1"
      @toggle="toggle"
    />

    <WalletsAnalyticsSummaryTilesView
      v-if="summary.length"
      :currencyCode="currenciesStore.base"
      :items="summary"
    />
  </section>
</template>
