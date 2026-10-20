<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { AxisChartType } from '~/components/stat/chart/types'
import type { ChartSeries } from '~/components/stat/types'
import type { AnalyticsLegendItem } from '~/components/wallets/analytics/LegendView.vue'
import type { AnalyticsOption } from '~/components/wallets/analytics/SettingsMenu.vue'
import type { AnalyticsBase } from '~/components/wallets/analytics/useAnalyticsBase'

import { useAmount } from '~/components/amount/useAmount'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { defaultConfig } from '~/components/stat/config/schema'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { statisticsRowsSeries } from '~/components/wallets/analytics/balanceHistory'
import { cashflowPoints } from '~/components/wallets/analytics/cashflow'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  base: AnalyticsBase
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const { computeTotalForTrnsIds } = useAmount()

/** Ids of the wallets statistics rows the chart can draw, in the block's order. */
const ROW_IDS = ['total', 'isWithdrawable', 'isAvailable', 'isAvailableAll', 'cash', 'bank_account', 'deposit', 'credit_card', 'loan', 'crypto', 'debt'] as const
const CASHFLOW_IDS = ['income', 'expense', 'interest', 'net'] as const
type CashflowId = typeof CASHFLOW_IDS[number]

const options = useStorage(WALLET_STORAGE_KEYS.analyticsCashflow, {
  chartType: 'bar' as AxisChartType,
  hidden: ['net'] as string[],
  mode: 'cashflow' as 'cashflow' | 'rows',
  rowsHidden: [] as string[],
}, localStorage, { mergeDefaults: true })

const colors: Record<CashflowId, string> = {
  expense: 'var(--color-expense-1)',
  income: 'var(--color-income-1)',
  interest: 'var(--ui-warning)',
  net: 'var(--ui-primary)',
}

const trnsIds = computed(() => trnsStore.getStoreTrnsIds({ dates: props.base.range.value, walletsIds: props.base.walletIds.value }))
const cashflow = computed(() => cashflowPoints({
  computeTotal: ids => computeTotalForTrnsIds(ids, { excludedCategoriesIds: categoriesStore.excludedFromStatsIds }),
  intervals: props.base.intervals.value,
  trnsIds: trnsIds.value,
  trnsItems: trnsStore.items ?? {},
}))

const rows = computed(() => statisticsRowsSeries({
  balances: props.base.balances.value,
  flags: props.base.flags.value,
  rowIds: [...ROW_IDS],
  toBaseAt: props.base.toBaseAt,
  walletIds: props.base.walletIds.value,
  wallets: walletsStore.items ?? {},
}).filter(row => row.data.some(value => value !== 0)))

const isRows = computed(() => options.value.mode === 'rows')
const hiddenKey = computed(() => isRows.value ? 'rowsHidden' : 'hidden')
const hidden = computed(() => new Set(options.value[hiddenKey.value]))

const all = computed(() => isRows.value
  ? rows.value.map(row => ({ color: row.color!, data: row.data, id: row.id, name: t(`money.types.${row.id}`) }))
  : CASHFLOW_IDS.map(id => ({ color: colors[id], data: cashflow.value[id], id, name: t(`wallets.analytics.cashflow.${id}`) })))

const chartSeries = computed<ChartSeries[]>(() => all.value
  .filter(item => !hidden.value.has(item.id))
  .map(item => ({ color: item.color, data: item.data, name: item.name, type: isRows.value ? 'line' : options.value.chartType })))

const legend = computed<AnalyticsLegendItem[]>(() => all.value.map((item) => {
  const sum = item.data.reduce((total, value) => total + value, 0)
  return {
    color: item.color,
    id: item.id,
    isHidden: hidden.value.has(item.id),
    name: item.name,
    // Rows are balances: the last point and its change; flows are a sum and its per-period average.
    secondLabel: t(isRows.value ? 'wallets.analytics.balance.change' : 'wallets.analytics.cashflow.average'),
    secondValue: isRows.value ? (item.data.at(-1) ?? 0) - (item.data[0] ?? 0) : (item.data.length ? sum / item.data.length : 0),
    value: isRows.value ? item.data.at(-1) ?? 0 : sum,
  }
}))

function toggle(id: string) {
  const list = options.value[hiddenKey.value]
  options.value[hiddenKey.value] = hidden.value.has(id) ? list.filter(item => item !== id) : [...list, id]
}

const chartConfig = computed(() => ({
  ...defaultConfig.chart,
  // Interest is part of the expense, so stacking would count it twice.
  isGrouped: false,
  isShowScale: true,
  line: { ...defaultConfig.chart.line, isShowPoints: false },
  type: isRows.value ? 'line' as const : options.value.chartType,
}))

const modeItems = computed(() => (['cashflow', 'rows'] as const).map(value => ({ label: t(`wallets.analytics.cashflow.modes.${value}`), value })))

// Balances only read as lines, so the type switch is for the cashflow mode.
const settings = computed<AnalyticsOption[]>(() => isRows.value
  ? []
  : [{
      id: 'chartType',
      items: (['bar', 'line'] as const).map(value => ({ label: t(`wallets.analytics.chartType.${value}`), value })),
      label: t('wallets.analytics.chartType.label'),
      value: options.value.chartType,
    }])

function onSetting(id: string, value: number | string) {
  options.value = { ...options.value, [id]: value }
}
</script>

<template>
  <section class="grid min-w-0 content-start gap-3" data-analytics-cashflow>
    <div class="flex items-center gap-2">
      <UiTitleSection class="grow">
        {{ t(isRows ? 'wallets.analytics.cashflow.modes.rows' : 'wallets.analytics.cashflow.title') }}
      </UiTitleSection>
      <WalletsAnalyticsSettingsMenu
        v-if="settings.length"
        :options="settings"
        :title="t('wallets.analytics.cashflow.title')"
        @change="onSetting"
      />
    </div>

    <UiTabs
      :items="modeItems"
      :modelValue="options.mode"
      size="xs"
      variant="flat"
      :grow="false"
      :itemGrow="false"
      align="left"
      @update:modelValue="value => onSetting('mode', value)"
    />

    <div class="min-h-44 min-w-0">
      <LazyStatChartAxisView
        isTooltipOnTap
        :chartConfig
        :chartType="chartConfig.type"
        :period="props.base.effectivePeriod.value"
        :series="chartSeries"
        :xAxisLabels="props.base.xAxisLabels.value"
      />
    </div>

    <WalletsAnalyticsLegendView
      :currencyCode="currenciesStore.base"
      :items="legend"
      isToggleable
      @toggle="toggle"
    />
  </section>
</template>
