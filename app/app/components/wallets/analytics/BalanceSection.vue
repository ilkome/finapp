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
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { formatChartTooltipLabel } from '~/components/stat/chart/format'
import { defaultConfig } from '~/components/stat/config/schema'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { balanceExtremes, balanceSeries, changeDecomposition, changeSeries, OTHER_SERIES_ID, periodChange, splitOpening, walletBalancesAt } from '~/components/wallets/analytics/balanceHistory'
import { toChartSeries } from '~/components/wallets/analytics/chartSeries'
import { downloadCsv, toCsv } from '~/components/wallets/analytics/export'
import { MONTH_MS, nextMilestone } from '~/components/wallets/analytics/stats'
import { balanceTooltipRows } from '~/components/wallets/analytics/tooltips'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { isCreditProduct } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  base: AnalyticsBase
}>()

const { locale, t } = useI18n()
const router = useRouter()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const trnsStore = useTrnsStore()
const categoriesStore = useCategoriesStore()
const dateLocale = useDateLocale()

const options = useStorage(WALLET_STORAGE_KEYS.analyticsBalance, {
  breakdown: 'total' as BalanceBreakdown,
  chartType: 'line' as AxisChartType,
  hidden: [] as string[],
  isShowPrevious: false,
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

const decomposition = computed(() => changeDecomposition({
  excludedCategoryIds: categoriesStore.excludedFromStatsIds,
  intervals: props.base.intervals.value,
  pointBalances: props.base.pointBalances.value,
  toBaseAtPoint: props.base.toBaseAtPoint,
  trnsIds: trnsStore.getStoreTrnsIds({ dates: props.base.range.value, walletsIds: scopeWalletIds.value }),
  trnsItems: trnsStore.items ?? {},
  walletIds: scopeWalletIds.value,
  wallets: walletsStore.items ?? {},
}))

const summary = computed<SummaryTile[]>(() => {
  const { ath, max, min } = extremes.value
  const { flows, other, revaluation } = decomposition.value
  const parts: SummaryTile[] = [
    { amount: flows, caption: t('wallets.analytics.balance.parts.flowsHint'), id: 'flows', isShowPlus: true, label: t('wallets.analytics.balance.parts.flows') },
    ...(revaluation ? [{ amount: revaluation, caption: t('wallets.analytics.balance.parts.revaluationHint'), id: 'revaluation', isShowPlus: true, label: t('wallets.analytics.balance.parts.revaluation') }] : []),
    ...(other ? [{ amount: other, caption: t('wallets.analytics.balance.parts.otherHint'), id: 'other', isShowPlus: true, label: t('wallets.analytics.balance.parts.other') }] : []),
  ]
  const dateOf = (date: number) => formatByLocale(date, 'd MMM yyyy', dateLocale.value)
  const now = series.value.reduce((sum, item) => sum + (item.data.at(-1) ?? 0), 0)
  const { end, start } = props.base.range.value
  const change = series.value.reduce((sum, item) => sum + periodChange(item), 0)
  const milestone = nextMilestone(now, change / ((end - start) / MONTH_MS), end)
  const milestoneTile: SummaryTile = {
    amount: milestone.target,
    caption: milestone.date === null ? t('wallets.analytics.balance.milestoneNoPace') : `${t('wallets.analytics.balance.milestoneBy')} ${formatByLocale(milestone.date, 'LLLL yyyy', dateLocale.value)}`,
    id: 'milestone',
    label: t('wallets.analytics.balance.milestone'),
  }
  return [
    ...parts,
    milestoneTile,
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

/** The scope total over the previous period's interval ends, priced by the rates right before this range. */
const previousTotal = computed(() => {
  const intervals = props.base.previousIntervals.value
  if (!options.value.isShowPrevious || !intervals)
    return null
  const balances = walletBalancesAt(trnsStore.items ?? {}, walletsStore.items ?? {}, intervals.map(interval => interval.end))
  return balanceSeries({ balances, breakdown: 'total', scope: options.value.scope, toBaseAt: () => props.base.toBaseAt(-1), walletIds: props.base.walletIds.value, wallets: walletsStore.items ?? {} })[0]?.data ?? null
})

const chartSeries = computed<ChartSeries[]>(() => [
  ...series.value
    .filter(item => !hidden.value.has(item.id))
    .map((item, index) => ({ color: item.color, data: item.data, markPoint: index ? undefined : athMarkPoint.value, name: nameOf(item.id, item.name), type: options.value.chartType })),
  ...(previousTotal.value ? [{ color: 'var(--ui-text-muted)', data: previousTotal.value, isGhost: true, name: t('wallets.analytics.previousPeriod'), type: 'line' as const }] : []),
])

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

// No wallets or no moves at all: empty axes would only look like a flat zero balance.
const isEmpty = computed(() => !scopeWalletIds.value.length || series.value.every(item => !item.opening && item.data.every(value => value === 0)))

function exportCsv() {
  const period = props.base.effectivePeriod.value
  const labels = props.base.intervals.value.map(interval => formatChartTooltipLabel(interval.start, period, locale.value))
  downloadCsv(t('wallets.analytics.balance.title'), toCsv(labels, toChartSeries(chartSeries.value, currenciesStore.base)))
}

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
  {
    id: 'isShowPrevious',
    items: [{ label: t('wallets.analytics.hide'), value: 'no' }, { label: t('wallets.analytics.show'), value: 'yes' }],
    label: t('wallets.analytics.previousOverlay'),
    value: options.value.isShowPrevious ? 'yes' : 'no',
  },
])

function onSetting(id: string, value: number | string) {
  options.value = { ...options.value, hidden: id === 'breakdown' ? [] : options.value.hidden, [id]: id === 'isShowPrevious' ? value === 'yes' : value }
}
</script>

<template>
  <section class="grid min-w-0 content-start gap-3" data-analytics-balance>
    <div class="flex items-center gap-2">
      <UiTitleSection class="grow">
        {{ t('wallets.analytics.balance.title') }}
      </UiTitleSection>
      <UButton
        color="neutral"
        variant="ghost"
        size="sm"
        icon="lucide:download"
        :aria-label="t('wallets.analytics.exportCsv')"
        data-analytics-export
        @click="exportCsv"
      />
      <WalletsAnalyticsSettingsMenu
        :options="settings"
        :title="t('wallets.analytics.balance.title')"
        @change="onSetting"
      />
    </div>

    <UiText v-if="isEmpty" variant="meta" class="px-2" data-analytics-empty>
      {{ t(scopeWalletIds.length ? 'wallets.analytics.empty.noTrns' : 'wallets.analytics.empty.noWallets') }}
    </UiText>

    <div v-else class="min-h-44 min-w-0">
      <LazyStatChartAxisView
        isTooltipOnTap
        scaleMode="fit"
        :chartConfig
        :chartType="options.chartType"
        :period="props.base.effectivePeriod.value"
        :series="toChartSeries(chartSeries, currenciesStore.base)"
        :tooltipLinkLabel="t('wallets.analytics.openTrns')"
        :tooltipRows
        :xAxisLabels="props.base.xAxisLabels.value"
        @tooltipLink="index => router.push(props.base.historyLocation(index))"
      />
    </div>

    <div v-if="!isEmpty" class="min-h-28 min-w-0">
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
      v-if="!isEmpty"
      :currencyCode="currenciesStore.base"
      :items="legend"
      :isToggleable="legend.length > 1"
      @toggle="toggle"
    />

    <WalletsAnalyticsSummaryTilesView
      v-if="!isEmpty && summary.length"
      :currencyCode="currenciesStore.base"
      :items="summary"
    />
  </section>
</template>
