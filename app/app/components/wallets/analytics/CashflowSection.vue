<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { addCivilDays, addCivilYears, u } from '~~/utils/date/civil'
import { getEndOf } from '~~/utils/date/period'

import type { AxisChartType } from '~/components/stat/chart/types'
import type { ChartSeries } from '~/components/stat/types'
import type { AnalyticsLegendItem } from '~/components/wallets/analytics/LegendView.vue'
import type { AnalyticsOption } from '~/components/wallets/analytics/SettingsMenu.vue'
import type { SummaryTile } from '~/components/wallets/analytics/SummaryTilesView.vue'
import type { AnalyticsBase } from '~/components/wallets/analytics/useAnalyticsBase'

import { getTotal } from '~/components/amount/getTotal'
import { formatAmount, minorToAmount } from '~/components/amount/utils'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { formatChartTooltipLabel } from '~/components/stat/chart/format'
import { defaultConfig } from '~/components/stat/config/schema'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { periodChange, splitOpening, statisticsRowsSeries } from '~/components/wallets/analytics/balanceHistory'
import { cashflowPoints, debtPaymentsPoints } from '~/components/wallets/analytics/cashflow'
import { toChartSeries } from '~/components/wallets/analytics/chartSeries'
import { downloadCsv, toCsv } from '~/components/wallets/analytics/export'
import { cumulative, expenseAnomalies, incomeStability, intervalStats, PACE_CURVE_WINDOW, PACE_WINDOW, paceCurve, paceOf, savingsRateTrend } from '~/components/wallets/analytics/stats'
import { balanceTooltipRows, cashflowTooltipRows, formatPercent, savingsRate } from '~/components/wallets/analytics/tooltips'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  base: AnalyticsBase
}>()

const { locale, t } = useI18n()
const router = useRouter()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()

/** Ids of the wallets statistics rows the chart can draw, in the block's order. */
const ROW_IDS = ['total', 'isWithdrawable', 'isAvailable', 'isAvailableAll', 'cash', 'bank_account', 'deposit', 'credit_card', 'loan', 'crypto', 'debt'] as const
const DAY_MS = 86_400_000
const CASHFLOW_IDS = ['income', 'expense', 'interest', 'net'] as const
type CashflowId = typeof CASHFLOW_IDS[number]

const options = useStorage(WALLET_STORAGE_KEYS.analyticsCashflow, {
  chartType: 'bar' as AxisChartType,
  hidden: [] as string[],
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
const sumOf = (values: number[]) => values.reduce((total, value) => total + value, 0)
function totalOf(ids: string[], toBase: ReturnType<typeof props.base.tryToBaseAt>) {
  return getTotal({
    excludedCategoriesIds: categoriesStore.excludedFromStatsIds,
    toBase,
    trnsIds: ids,
    trnsItems: trnsStore.items ?? {},
    walletsItems: walletsStore.items ?? {},
  })
}

// Each interval's flows use its own rates, the same set as its balance.
const cashflow = computed(() => cashflowPoints({
  computeTotal: (ids, index) => totalOf(ids, props.base.tryToBaseAt(index)),
  intervals: props.base.intervals.value,
  trnsIds: trnsIds.value,
  trnsItems: trnsStore.items ?? {},
}))

const toDebts = computed(() => debtPaymentsPoints({
  intervals: props.base.intervals.value,
  toBaseAt: props.base.toBaseAt,
  trnsIds: trnsIds.value,
  trnsItems: trnsStore.items ?? {},
  walletIds: new Set(props.base.walletIds.value),
  wallets: walletsStore.items ?? {},
}))

const rows = computed(() => splitOpening(statisticsRowsSeries({
  balances: props.base.pointBalances.value,
  flags: props.base.flags.value,
  rowIds: [...ROW_IDS],
  toBaseAt: props.base.toBaseAtPoint,
  walletIds: props.base.walletIds.value,
  wallets: walletsStore.items ?? {},
})).filter(row => row.data.some(value => value !== 0)))

const isRows = computed(() => options.value.mode === 'rows')
const hiddenKey = computed(() => isRows.value ? 'rowsHidden' : 'hidden')
const hidden = computed(() => new Set(options.value[hiddenKey.value]))

const all = computed(() => isRows.value
  ? rows.value.map(row => ({ color: row.color!, data: row.data, id: row.id, name: t(`money.types.${row.id}`), opening: row.opening }))
  : CASHFLOW_IDS.map(id => ({ color: colors[id], data: cashflow.value[id], id, name: t(`wallets.analytics.cashflow.${id}`), opening: undefined as number | undefined })))

const anomalies = computed(() => isRows.value ? [] : expenseAnomalies(cashflow.value.expense, props.base.fullCount.value))

const chartSeries = computed<ChartSeries[]>(() => all.value
  .filter(item => !hidden.value.has(item.id))
  .map(item => ({
    color: item.color,
    data: item.data,
    markPoint: item.id === 'expense' && anomalies.value.length
      ? { data: anomalies.value.map(index => ({ coord: [index, minorToAmount(item.data[index]!, currenciesStore.base)] })), label: { show: false }, symbol: 'pin', symbolSize: 16 }
      : undefined,
    name: item.name,
    type: isRows.value ? 'line' : options.value.chartType,
  })))

/** The same intervals a year earlier; for the year interval that is just the previous bar. */
const lastYear = computed(() => {
  if (isRows.value || props.base.effectivePeriod.value === 'year')
    return null
  const intervals = props.base.intervals.value.map(interval => ({ end: addCivilYears(interval.end, -1), start: addCivilYears(interval.start, -1) }))
  const range = { end: intervals.at(-1)?.end ?? 0, start: intervals[0]?.start ?? 0 }
  return cashflowPoints({
    computeTotal: ids => totalOf(ids, props.base.tryToBaseAt(-1)),
    intervals,
    trnsIds: trnsStore.getStoreTrnsIds({ dates: range, walletsIds: props.base.walletIds.value }),
    trnsItems: trnsStore.items ?? {},
  })
})

// The rates right before the range price the previous period: one rate set for the whole compare.
const previous = computed(() => {
  const range = props.base.previousRange.value
  return range ? totalOf(trnsStore.getStoreTrnsIds({ dates: range, walletsIds: props.base.walletIds.value }), props.base.tryToBaseAt(-1)) : null
})

/** The current interval against the last full ones at the same elapsed day; null when today closes the interval. */
const pace = computed(() => {
  const { effectivePeriod, fullCount, intervals } = props.base
  const current = intervals.value[fullCount.value]
  if (!current || effectivePeriod.value === 'day')
    return null
  const elapsed = current.end - current.start
  const natural = getEndOf(u(current.start), effectivePeriod.value).getTime() - current.start
  const pastIntervals = intervals.value.slice(Math.max(0, fullCount.value - PACE_WINDOW), fullCount.value)
  const offset = fullCount.value - pastIntervals.length
  const byNow = cashflowPoints({
    computeTotal: (ids, index) => totalOf(ids, props.base.tryToBaseAt(offset + index)),
    intervals: pastIntervals.map(interval => ({ end: Math.min(interval.end, interval.start + elapsed), start: interval.start })),
    trnsIds: trnsIds.value,
    trnsItems: trnsStore.items ?? {},
  })
  return Object.fromEntries((['expense', 'income'] as const).map(id => [id, paceOf({
    actual: cashflow.value[id][fullCount.value] ?? 0,
    elapsedShare: elapsed / natural,
    past: pastIntervals.map((_, index) => ({ byNow: byNow[id][index]!, total: cashflow.value[id][offset + index]! })),
  })])) as Record<'expense' | 'income', ReturnType<typeof paceOf>>
})

const tooltipRows = computed(() => isRows.value
  ? balanceTooltipRows({
      changeLabel: t('wallets.analytics.balance.change'),
      currencyCode: currenciesStore.base,
      series: all.value.filter(item => !hidden.value.has(item.id)),
    })
  : cashflowTooltipRows({
      colors: { ...colors, toDebts: 'var(--ui-text-muted)' },
      currencyCode: currenciesStore.base,
      labels: {
        expense: t('wallets.analytics.cashflow.expense'),
        income: t('wallets.analytics.cashflow.income'),
        interest: t('wallets.analytics.cashflow.interest'),
        net: t('wallets.analytics.cashflow.net'),
        savingsRate: t('wallets.analytics.cashflow.savingsRate'),
        toDebts: t('wallets.analytics.cashflow.toDebts'),
      },
      points: cashflow.value,
      toDebts: toDebts.value,
    }).map((rows, index) => {
      const money = (value: number) => formatAmount(value, currenciesStore.base)
      const extra: typeof rows = []
      const year = lastYear.value
      if (year && (year.income[index] || year.expense[index])) {
        extra.push({
          amount: minorToAmount(year.net[index]!, currenciesStore.base),
          color: 'var(--ui-text-dimmed)',
          description: `${t('wallets.analytics.cashflow.income')} ${money(year.income[index]!)} · ${t('wallets.analytics.cashflow.expense')} ${money(year.expense[index]!)}`,
          key: 'yoy',
          name: t('wallets.analytics.cashflow.yearAgo'),
        })
      }
      // The unfinished interval draws its real value; the estimate for the whole of it goes here.
      if (index === props.base.fullCount.value && pace.value) {
        extra.push({
          amount: -minorToAmount(pace.value.expense.estimate, currenciesStore.base),
          color: colors.expense,
          description: t('wallets.analytics.cashflow.inProgress'),
          key: 'estimate',
          name: t('wallets.analytics.cashflow.expenseEstimate'),
        })
      }
      return [...rows, ...extra]
    }))

const summary = computed<SummaryTile[]>(() => {
  const points = cashflow.value
  const period = props.base.effectivePeriod.value
  const labelOf = (index: number) => formatChartTooltipLabel(props.base.intervals.value[index]!.start, period, locale.value)
  const money = (value: number) => formatAmount(value, currenciesStore.base)
  const income = sumOf(points.income)
  const net = sumOf(points.net)
  const stats = intervalStats(points.net, props.base.fullCount.value)
  const tiles: SummaryTile[] = [{ id: 'savingsRate', label: t('wallets.analytics.cashflow.savingsRateTitle'), text: formatPercent(savingsRate(net, income)) }]
  if (stats) {
    tiles.push(
      { amount: stats.median, caption: `${t('wallets.analytics.cashflow.average')} ${money(stats.average)}`, id: 'median', label: t('wallets.analytics.cashflow.medianNet') },
      { amount: points.net[stats.bestIndex], caption: labelOf(stats.bestIndex), id: 'best', label: t('wallets.analytics.cashflow.best') },
      { amount: points.net[stats.worstIndex], caption: labelOf(stats.worstIndex), id: 'worst', label: t('wallets.analytics.cashflow.worst') },
    )
  }
  if (pace.value) {
    const { expense } = pace.value
    tiles.push({
      amount: points.expense[props.base.fullCount.value],
      caption: expense.expectedByNow === undefined
        ? `${t('wallets.analytics.cashflow.estimate')} ${money(expense.estimate)}`
        : `${t('wallets.analytics.cashflow.usuallyByNow')} ${money(expense.expectedByNow)}`,
      id: 'paceExpense',
      label: t('wallets.analytics.cashflow.soFar'),
    })
  }
  const stability = incomeStability(points.income, props.base.fullCount.value)
  if (stability) {
    tiles.push({
      caption: `${money(stability.min)} · ${money(stability.median)} · ${money(stability.max)}`,
      id: 'incomeStability',
      label: t('wallets.analytics.cashflow.incomeStability'),
      text: formatPercent(stability.share),
    })
  }
  if (previous.value) {
    const now = { expense: sumOf(points.expense), income, net }
    for (const id of ['income', 'expense', 'net'] as const) {
      const before = previous.value[id]
      const delta = now[id] - before
      tiles.push({
        amount: delta,
        caption: before ? `${delta > 0 ? '+' : ''}${formatPercent(delta / Math.abs(before))}` : undefined,
        id: `previous-${id}`,
        isShowPlus: true,
        label: t(`wallets.analytics.cashflow.vsPrevious.${id}`),
      })
    }
  }
  return tiles
})

const isEmpty = computed(() => isRows.value ? !rows.value.length : !trnsIds.value.length)

// Full intervals only: a half-finished one has half its income.
const savingsSeries = computed<ChartSeries[]>(() => {
  const count = props.base.fullCount.value
  const { rates, rolling } = savingsRateTrend(cashflow.value.income.slice(0, count), cashflow.value.net.slice(0, count))
  const percent = (values: (number | null)[]) => values.map(value => value === null ? Number.NaN : Math.round(value * 100))
  return [
    { color: 'var(--ui-primary)', data: percent(rates), name: t('wallets.analytics.cashflow.savingsRateTitle'), type: 'line' },
    { color: 'var(--ui-text-dimmed)', data: percent(rolling), name: t('wallets.analytics.cashflow.rollingAverage'), type: 'line' },
  ]
})
const savingsChartConfig = computed(() => ({ ...defaultConfig.chart, isGrouped: false, isShowScale: true, line: { ...defaultConfig.chart.line, isShowPoints: true, isSmooth: false }, type: 'line' as const }))

function exportCsv() {
  const period = props.base.effectivePeriod.value
  const labels = props.base.intervals.value.map(interval => formatChartTooltipLabel(interval.start, period, locale.value))
  const title = t(isRows.value ? 'wallets.analytics.cashflow.modes.rows' : 'wallets.analytics.cashflow.title')
  downloadCsv(title, toCsv(labels, toChartSeries(all.value.map(item => ({ ...item, type: 'line' as const })), currenciesStore.base)))
}

/** Cumulative expense of the current interval by day against the typical curve of past ones. */
const spendingPace = computed(() => {
  const { effectivePeriod, fullCount, intervals } = props.base
  const current = intervals.value[fullCount.value]
  if (isRows.value || !current || effectivePeriod.value === 'day')
    return null
  const length = Math.round((getEndOf(u(current.start), effectivePeriod.value).getTime() - current.start) / DAY_MS)
  const past = intervals.value.slice(Math.max(0, fullCount.value - PACE_CURVE_WINDOW), fullCount.value)
  if (!past.length)
    return null
  const days = (interval: { end: number, start: number }) => Array.from({ length: Math.round((interval.end - interval.start) / DAY_MS) }, (_, day) => {
    const start = addCivilDays(interval.start, day)
    return { end: start + DAY_MS - 1, start }
  })
  const daily = (list: { end: number, start: number }[], index: (day: number) => number) => cashflowPoints({
    computeTotal: (ids, day) => totalOf(ids, props.base.tryToBaseAt(index(day))),
    intervals: list,
    trnsIds: trnsIds.value,
    trnsItems: trnsStore.items ?? {},
  }).expense
  const offset = fullCount.value - past.length
  const curves = past.map((interval, index) => cumulative(daily(days(interval), () => offset + index)))
  const actual = cumulative(daily(days(current), () => fullCount.value))
  const curve = paceCurve(curves, length)
  const labels = Array.from({ length }, (_, day) => addCivilDays(current.start, day))
  const pad = (values: number[]) => labels.map((_, day) => day < values.length ? values[day]! : Number.NaN)
  return {
    labels,
    series: [
      { color: 'var(--ui-text-dimmed)', data: curve.p75, name: t('wallets.analytics.cashflow.pace.p75'), type: 'line' as const },
      { color: 'var(--ui-text-muted)', data: curve.median, name: t('wallets.analytics.cashflow.pace.median'), type: 'line' as const },
      { color: 'var(--ui-text-dimmed)', data: curve.p25, name: t('wallets.analytics.cashflow.pace.p25'), type: 'line' as const },
      { color: colors.expense, data: pad(actual), name: t('wallets.analytics.cashflow.pace.current'), type: 'line' as const },
    ],
  }
})
const paceChartConfig = computed(() => ({ ...defaultConfig.chart, isGrouped: false, isShowScale: true, line: { ...defaultConfig.chart.line, isShowPoints: false, isSmooth: false }, type: 'line' as const }))

const legend = computed<AnalyticsLegendItem[]>(() => all.value.map((item) => {
  const sum = item.data.reduce((total, value) => total + value, 0)
  return {
    color: item.color,
    id: item.id,
    isHidden: hidden.value.has(item.id),
    name: item.name,
    // Rows are balances: the last point and its change; flows are a sum and its per-period average.
    secondLabel: t(isRows.value ? 'wallets.analytics.balance.change' : 'wallets.analytics.cashflow.average'),
    secondValue: isRows.value ? periodChange(item) : (item.data.length ? sum / item.data.length : 0),
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

    <UiText v-if="isEmpty" variant="meta" class="px-2" data-analytics-empty>
      {{ t('wallets.analytics.empty.noTrns') }}
    </UiText>

    <div v-else class="min-h-44 min-w-0">
      <LazyStatChartAxisView
        isTooltipOnTap
        :scaleMode="isRows ? 'fit' : 'zero'"
        :chartConfig
        :chartType="chartConfig.type"
        :period="props.base.effectivePeriod.value"
        :series="toChartSeries(chartSeries, currenciesStore.base)"
        :tooltipLinkLabel="t('wallets.analytics.openTrns')"
        :tooltipRows
        :xAxisLabels="props.base.xAxisLabels.value"
        @tooltipLink="index => router.push(props.base.historyLocation(index))"
      />
    </div>

    <WalletsAnalyticsLegendView
      v-if="!isEmpty"
      :currencyCode="currenciesStore.base"
      :items="legend"
      isToggleable
      @toggle="toggle"
    />

    <div v-if="spendingPace && !isEmpty" class="grid min-w-0 gap-1" data-analytics-spending-pace>
      <UiText variant="caption" class="px-2">
        {{ t('wallets.analytics.cashflow.pace.title') }}
      </UiText>
      <div class="min-h-32 min-w-0">
        <LazyStatChartAxisView
          isTooltipOnTap
          :chartConfig="paceChartConfig"
          chartType="line"
          period="day"
          :series="toChartSeries(spendingPace.series, currenciesStore.base)"
          :xAxisLabels="spendingPace.labels"
        />
      </div>
    </div>

    <div v-if="!isRows && !isEmpty && props.base.fullCount.value > 1" class="grid min-w-0 gap-1" data-analytics-savings-rate>
      <UiText variant="caption" class="px-2">
        {{ t('wallets.analytics.cashflow.savingsRateTrend') }}
      </UiText>
      <div class="min-h-32 min-w-0">
        <LazyStatChartAxisView
          isTooltipOnTap
          scaleMode="fit"
          :chartConfig="savingsChartConfig"
          chartType="line"
          :period="props.base.effectivePeriod.value"
          :series="savingsSeries"
          :xAxisLabels="props.base.xAxisLabels.value.slice(0, props.base.fullCount.value)"
        />
      </div>
    </div>

    <WalletsAnalyticsSummaryTilesView
      v-if="!isRows && !isEmpty"
      :currencyCode="currenciesStore.base"
      :items="summary"
    />
  </section>
</template>
