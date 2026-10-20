<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { AxisChartType } from '~/components/stat/chart/types'
import type { ChartSeries } from '~/components/stat/types'
import type { BalanceBreakdown, BalanceScope } from '~/components/wallets/analytics/balanceHistory'
import type { AnalyticsLegendItem } from '~/components/wallets/analytics/LegendView.vue'
import type { AnalyticsOption } from '~/components/wallets/analytics/SettingsMenu.vue'
import type { AnalyticsBase, RatesMode } from '~/components/wallets/analytics/useAnalyticsBase'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { defaultConfig } from '~/components/stat/config/schema'
import { toChartSeries } from '~/components/wallets/analytics/chartSeries'
import { balanceSeries, OTHER_SERIES_ID } from '~/components/wallets/analytics/balanceHistory'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  base: AnalyticsBase
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()

const options = useStorage(WALLET_STORAGE_KEYS.analyticsBalance, {
  breakdown: 'total' as BalanceBreakdown,
  chartType: 'line' as AxisChartType,
  hidden: [] as string[],
  scope: 'net' as BalanceScope,
}, localStorage, { mergeDefaults: true })

const series = computed(() => balanceSeries({
  balances: props.base.balances.value,
  breakdown: options.value.breakdown,
  scope: options.value.scope,
  toBaseAt: props.base.toBaseAt,
  walletIds: props.base.walletIds.value,
  wallets: walletsStore.items ?? {},
}))

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
const chartSeries = computed<ChartSeries[]>(() => series.value
  .filter(item => !hidden.value.has(item.id))
  .map(item => ({ color: item.color, data: item.data, name: nameOf(item.id, item.name), type: options.value.chartType })))

const legend = computed<AnalyticsLegendItem[]>(() => series.value.map(item => ({
  color: item.color ?? 'var(--ui-text-muted)',
  id: item.id,
  isHidden: hidden.value.has(item.id),
  name: nameOf(item.id, item.name),
  secondLabel: t('wallets.analytics.balance.change'),
  secondValue: (item.data.at(-1) ?? 0) - (item.data[0] ?? 0),
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
    id: 'rates',
    items: (['historical', 'current'] as const).map(value => ({ label: t(`wallets.analytics.rates.${value}`), value })),
    label: t('wallets.analytics.rates.label'),
    value: props.base.ratesMode.value,
  },
])

function onSetting(id: string, value: number | string) {
  if (id === 'rates')
    props.base.setRatesMode(value as RatesMode)
  else
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
        :xAxisLabels="props.base.xAxisLabels.value"
      />
    </div>

    <WalletsAnalyticsLegendView
      :currencyCode="currenciesStore.base"
      :items="legend"
      :isToggleable="legend.length > 1"
      @toggle="toggle"
    />
  </section>
</template>
