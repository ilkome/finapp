<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { formatByLocale } from '~~/utils/date/civil'
import { parseAmountInput } from '~~/utils/money/parseInput'

import type { ChartSeries } from '~/components/stat/types'
import type { ForecastMonthRow, ForecastScenario } from '~/components/wallets/analytics/ForecastMonthsView.vue'
import type { AmountMode, CardPaymentMode } from '~/components/wallets/analytics/forecastSettings'
import type { ObligationRow } from '~/components/wallets/analytics/ObligationsView.vue'
import type { RegularListItem } from '~/components/wallets/analytics/RegularListView.vue'
import type { AnalyticsOption } from '~/components/wallets/analytics/SettingsMenu.vue'
import type { SummaryTile } from '~/components/wallets/analytics/SummaryTilesView.vue'

import { amountToMinor, minorToAmount } from '~/components/amount/utils'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { defaultConfig } from '~/components/stat/config/schema'
import { toChartSeries } from '~/components/wallets/analytics/chartSeries'
import { downloadCsv, toCsv } from '~/components/wallets/analytics/export'
import { UPCOMING_DAYS, upcomingPayments } from '~/components/wallets/analytics/forecast'
import { amountModes, cardPaymentModes } from '~/components/wallets/analytics/forecastSettings'
import { forecastTooltipRows } from '~/components/wallets/analytics/tooltips'
import { useSharedForecast } from '~/components/wallets/analytics/useForecast'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const router = useRouter()
const dateLocale = useDateLocale()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const isChartMountReady = useIdleMount()
const { availableWalletIds, categories, cover, forecast, forecastWith, income, incomeOutsideWalletIds, obligations, regular, runwayOf, setCategory, settings, startWalletIds, today, toggleStartWallet, update } = useSharedForecast()

const view = useStorage(WALLET_STORAGE_KEYS.analyticsForecast, {
  scenario: 'both' as ForecastScenario,
}, localStorage, { mergeDefaults: true })

const horizonLabel = computed(() => `${t('wallets.analytics.forecast.horizon')} ${settings.value.horizonMonths} ${t('dates.month.plural', settings.value.horizonMonths)}`)

// The first full month speaks for a typical one; the current month is only what is left of it.
const typicalMonth = computed(() => forecast.value.months[1] ?? forecast.value.months[0])

const monthRows = computed<ForecastMonthRow[]>(() => forecast.value.months.map(month => ({
  endWithIncome: month.endWithIncome,
  endWithoutIncome: month.endWithoutIncome,
  income: month.income,
  key: month.start,
  label: formatByLocale(month.start, 'LLLL yyyy', dateLocale.value),
  obligations: month.obligations,
  regular: month.regular,
})))

/** Month the money runs out in, marked on its line, and the zero line it crosses. */
function runOutMarks(runway: number | null, data: number[]) {
  const index = runway === null ? -1 : forecast.value.months.findLastIndex(month => month.start <= runway)
  return {
    markLine: { data: [{ yAxis: 0 }], label: { show: false }, lineStyle: { color: 'var(--color-expense-1)', opacity: 0.4, type: 'dashed' }, silent: true, symbol: 'none' },
    markPoint: index < 0 ? undefined : { data: [{ coord: [index, minorToAmount(data[index] ?? 0, currenciesStore.base)] }], label: { show: false }, symbol: 'pin', symbolSize: 18 },
  }
}

const chartSeries = computed<ChartSeries[]>(() => {
  const withoutIncome = forecast.value.months.map(m => m.endWithoutIncome)
  const withIncome = forecast.value.months.map(m => m.endWithIncome)
  return [
    ...(view.value.scenario !== 'withIncome'
      ? [{ color: 'var(--color-expense-1)', data: withoutIncome, name: t('wallets.analytics.forecast.withoutIncome'), type: 'line' as const, ...runOutMarks(forecast.value.runwayWithoutIncome, withoutIncome) }]
      : []),
    ...(view.value.scenario !== 'withoutIncome'
      ? [{ color: 'var(--color-income-1)', data: withIncome, name: t('wallets.analytics.forecast.withIncome'), type: 'line' as const, ...runOutMarks(forecast.value.runwayWithIncome, withIncome) }]
      : []),
  ]
})
const tooltipRows = computed(() => {
  const months = forecast.value.months
  const monthOf = (day: number | null) => day === null ? -1 : months.findLastIndex(month => month.start <= day)
  return forecastTooltipRows({
    colors: { income: 'var(--color-income-1)', obligations: 'var(--ui-warning)', regular: 'var(--color-expense-1)', withIncome: 'var(--color-income-1)', withoutIncome: 'var(--color-expense-1)' },
    currencyCode: currenciesStore.base,
    labels: {
      income: t('wallets.analytics.forecast.income'),
      obligations: t('wallets.analytics.forecast.obligations'),
      regular: t('wallets.analytics.forecast.regular'),
      runOut: t('wallets.analytics.forecast.runsOut'),
      withIncome: t('wallets.analytics.forecast.withIncome'),
      withoutIncome: t('wallets.analytics.forecast.withoutIncome'),
    },
    months,
    runOut: { withIncome: monthOf(forecast.value.runwayWithIncome), withoutIncome: monthOf(forecast.value.runwayWithoutIncome) },
  })
})

const coverSeries = computed<ChartSeries[]>(() => [{ color: 'var(--ui-primary)', data: cover.value.values.map(value => value === null ? 0 : Math.round(value * 10) / 10), name: t('wallets.analytics.cover.title'), type: 'line' }])
const coverTooltipRows = computed(() => cover.value.values.map((value, index) => [{
  amount: value === null ? 0 : Math.round(value * 10) / 10,
  color: 'var(--ui-primary)',
  // The last point is today: its forecast runway also counts the obligation schedule.
  description: index === cover.value.values.length - 1 && forecast.value.runwayWithoutIncome !== null
    ? `${t('wallets.analytics.forecast.until')} ${formatByLocale(forecast.value.runwayWithoutIncome, 'd MMMM yyyy', dateLocale.value)}`
    : undefined,
  key: 'cover',
  name: t('wallets.analytics.cover.months'),
}]))
const coverChartConfig = { ...defaultConfig.chart, isShowScale: true, line: { ...defaultConfig.chart.line, isShowPoints: true, isSmooth: false }, type: 'line' as const }

function exportCsv() {
  const months = forecast.value.months
  const series = [
    { data: months.map(m => m.endWithoutIncome), name: t('wallets.analytics.forecast.withoutIncome') },
    { data: months.map(m => m.endWithIncome), name: t('wallets.analytics.forecast.withIncome') },
    { data: months.map(m => -m.regular), name: t('wallets.analytics.forecast.regular') },
    { data: months.map(m => -m.obligations), name: t('wallets.analytics.forecast.obligations') },
    { data: months.map(m => m.income), name: t('wallets.analytics.forecast.income') },
  ]
  downloadCsv(t('wallets.analytics.forecast.title'), toCsv(monthRows.value.map(row => row.label), toChartSeries(series.map(item => ({ ...item, type: 'line' as const })), currenciesStore.base)))
}

const chartConfig = { ...defaultConfig.chart, isShowScale: true, line: { ...defaultConfig.chart.line, isShowPoints: true, isSmooth: false }, type: 'line' as const }

const obligationRows = computed<ObligationRow[]>(() => {
  const byWallet = new Map<string, ObligationRow>()
  for (const item of obligations.value) {
    const row = byWallet.get(item.walletId)
    if (row) {
      row.horizonTotal += item.amount
      continue
    }
    const wallet = walletsStore.items?.[item.walletId]
    byWallet.set(item.walletId, {
      color: wallet?.color ?? 'var(--ui-text-muted)',
      horizonTotal: item.amount,
      kind: item.kind,
      name: wallet?.name ?? item.walletId,
      nextAmount: item.amount,
      nextDateLabel: formatByLocale(item.date, 'd MMM', dateLocale.value),
      walletId: item.walletId,
    })
  }
  return [...byWallet.values()]
})

const regularItems = computed<RegularListItem[]>(() => regular.value.map((item) => {
  const category = categoriesStore.items[item.categoryId]
  const parentId = category?.parentId
  return {
    amount: item.amount,
    categoryId: item.categoryId,
    color: category?.color ?? 'var(--ui-text-muted)',
    detectedAmount: item.detectedAmount,
    icon: category?.icon ?? 'lucide:circle',
    isAuto: item.isAuto,
    isOverridden: !!item.override,
    isRegular: item.isRegular,
    monthsWithSpending: item.monthsWithSpending,
    name: category?.name ?? item.categoryId,
    parentName: parentId ? categoriesStore.items[parentId]?.name : undefined,
  }
}))

// The switch flips the category; flipping it back to what detection says drops the manual entry.
function toggleRegular(categoryId: string) {
  const item = regular.value.find(entry => entry.categoryId === categoryId)
  if (!item)
    return
  const nextRegular = !item.isRegular
  const stored = categories.value[categoryId]
  if (nextRegular === item.isAuto && stored?.monthlyAmount === undefined)
    setCategory(categoryId, undefined)
  else
    setCategory(categoryId, { ...stored, isIncluded: nextRegular })
}

const editingId = ref<string | null>(null)
const editing = computed(() => regularItems.value.find(item => item.categoryId === editingId.value))
const draft = ref<{ amount: string, state: 'auto' | 'exclude' | 'include' }>({ amount: '', state: 'auto' })

function openEditor(categoryId: string) {
  const stored = categories.value[categoryId]
  draft.value = {
    amount: stored?.monthlyAmount === undefined ? '' : String(minorToAmount(stored.monthlyAmount, stored.currencyCode ?? currenciesStore.base)),
    state: stored?.isIncluded === undefined ? 'auto' : stored.isIncluded ? 'include' : 'exclude',
  }
  editingId.value = categoryId
}

function saveEditor(close: () => void) {
  const id = editingId.value
  if (!id)
    return
  const amount = parseAmountInput(draft.value.amount)
  const hasAmount = amount !== undefined && amount >= 0
  const base = currenciesStore.base
  if (draft.value.state === 'exclude')
    setCategory(id, { isIncluded: false })
  else if (draft.value.state === 'include' || hasAmount)
    setCategory(id, { ...(hasAmount ? { currencyCode: base, monthlyAmount: amountToMinor(amount, base) } : {}), isIncluded: draft.value.state === 'include' ? true : undefined })
  else
    setCategory(id, undefined)
  close()
}

const upcoming = computed(() => upcomingPayments(obligations.value, today.value))
const upcomingTiles = computed<SummaryTile[]>(() => {
  const { next, total } = upcoming.value
  if (!next)
    return []
  return [
    { amount: -next.amount, caption: `${formatByLocale(next.date, 'd MMMM', dateLocale.value)} · ${walletsStore.items?.[next.walletId]?.name ?? ''}`, id: 'nextPayment', label: t('wallets.analytics.upcoming.next') },
    { amount: -total, id: 'upcomingTotal', label: t('wallets.analytics.upcoming.total', { days: UPCOMING_DAYS }) },
  ]
})

const isWalletsOpen = ref(false)

// What-if: temporary edits, never saved.
const whatIf = ref({ amount: '', date: '', incomePercent: '', kind: 'expense' as 'expense' | 'income', spendingPercent: '' })
const whatIfScenario = computed(() => {
  const amount = parseAmountInput(whatIf.value.amount)
  const date = whatIf.value.date ? Date.parse(`${whatIf.value.date}T00:00:00Z`) : Number.NaN
  const factor = (value: string) => {
    const percent = parseAmountInput(value)
    return percent === undefined ? undefined : 1 + percent / 100
  }
  const minor = amount && Number.isFinite(date) ? amountToMinor(Math.abs(amount), currenciesStore.base) : 0
  return {
    events: minor ? [{ amount: whatIf.value.kind === 'income' ? minor : -minor, date }] : [],
    incomeFactor: factor(whatIf.value.incomePercent),
    spendingFactor: factor(whatIf.value.spendingPercent),
  }
})
const isWhatIfSet = computed(() => !!whatIfScenario.value.events.length || whatIfScenario.value.incomeFactor !== undefined || whatIfScenario.value.spendingFactor !== undefined)
const whatIfResult = computed(() => isWhatIfSet.value ? forecastWith(whatIfScenario.value) : null)
const runwayLabel = (date: number | null) => runwayOf(date).dateLabel ?? t('wallets.analytics.forecast.enough')

const settingsOptions = computed<AnalyticsOption[]>(() => [
  {
    id: 'scenario',
    items: (['both', 'withoutIncome', 'withIncome'] as const).map(value => ({ label: t(`wallets.analytics.forecast.scenarios.${value}`), value })),
    label: t('wallets.analytics.forecast.scenarios.label'),
    value: view.value.scenario,
  },
  {
    id: 'horizonMonths',
    items: [3, 6, 12, 24, 36].map(value => ({ label: String(value), value })),
    label: t('wallets.analytics.forecast.horizonMonths'),
    value: settings.value.horizonMonths,
  },
  {
    id: 'cardPaymentMode',
    items: cardPaymentModes.map(value => ({ label: t(`wallets.analytics.forecast.cardPayment.${value}`), value })),
    label: t('wallets.analytics.forecast.cardPayment.label'),
    value: settings.value.cardPaymentMode,
  },
  {
    id: 'historyMonths',
    items: [3, 6, 12].map(value => ({ label: String(value), value })),
    label: t('wallets.analytics.regular.windowMonths'),
    value: settings.value.historyMonths,
  },
  {
    id: 'regularMinMonths',
    items: Array.from({ length: settings.value.historyMonths }, (_, index) => index + 1)
      .filter(value => value >= Math.ceil(settings.value.historyMonths / 2))
      .map(value => ({ label: String(value), value })),
    label: t('wallets.analytics.regular.minMonths'),
    value: Math.min(settings.value.regularMinMonths, settings.value.historyMonths),
  },
  {
    id: 'regularAmountMode',
    items: amountModes.map(value => ({ label: t(`wallets.analytics.regular.amountModes.${value}`), value })),
    label: t('wallets.analytics.regular.amountMode'),
    value: settings.value.regularAmountMode,
  },
  {
    id: 'isByParentCategory',
    items: [{ label: t('wallets.analytics.regular.byCategory'), value: 'no' }, { label: t('wallets.analytics.regular.byParent'), value: 'yes' }],
    label: t('wallets.analytics.regular.groupBy'),
    value: settings.value.isByParentCategory ? 'yes' : 'no',
  },
])

function onSetting(id: string, value: number | string) {
  if (id === 'scenario')
    view.value = { ...view.value, scenario: value as ForecastScenario }
  else if (id === 'isByParentCategory')
    update({ isByParentCategory: value === 'yes' })
  else if (id === 'historyMonths')
    update({ historyMonths: Number(value), regularMinMonths: Math.min(settings.value.regularMinMonths, Number(value)) })
  else if (id === 'regularAmountMode')
    update({ regularAmountMode: value as AmountMode })
  else if (id === 'cardPaymentMode')
    update({ cardPaymentMode: value as CardPaymentMode })
  else
    update({ [id]: Number(value) })
}
</script>

<template>
  <section class="grid min-w-0 content-start gap-4" data-analytics-forecast>
    <div class="flex items-center gap-2">
      <UiTitleSection class="grow">
        {{ t('wallets.analytics.forecast.title') }}
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
        :options="settingsOptions"
        :title="t('wallets.analytics.forecast.title')"
        @change="onSetting"
      />
    </div>

    <UAlert
      v-if="incomeOutsideWalletIds.length"
      color="info"
      variant="subtle"
      icon="lucide:info"
      :title="t('wallets.analytics.forecast.incomeOutside', { wallets: incomeOutsideWalletIds.map(id => walletsStore.items?.[id]?.name ?? id).join(', ') })"
      :actions="[{ label: t('wallets.analytics.forecast.incomeOutsideAdd'), color: 'info', variant: 'link', onClick: () => incomeOutsideWalletIds.forEach(toggleStartWallet) }]"
      data-analytics-income-outside
    />

    <WalletsAnalyticsForecastSummaryView
      :currencyCode="currenciesStore.base"
      :horizonLabel
      :monthlyIncome="income"
      :monthlyObligations="typicalMonth?.obligations ?? 0"
      :monthlyRegular="typicalMonth?.regular ?? 0"
      :nextIncomeLabel="forecast.nextIncomeDate === null ? null : formatByLocale(forecast.nextIncomeDate, 'd MMMM', dateLocale)"
      :note="forecast.coincidence ? t(`wallets.analytics.forecast.coincidence.${forecast.coincidence}`) : null"
      :runwayWithIncome="runwayOf(forecast.runwayWithIncome)"
      :runwayWithoutIncome="runwayOf(forecast.runwayWithoutIncome)"
      :startBalance="forecast.startBalance"
      @editWallets="isWalletsOpen = true"
    />

    <details class="grid gap-2 rounded-md bg-elevated/30 px-3 py-2.5" data-analytics-what-if>
      <summary class="cursor-pointer text-sm text-toned">
        {{ t('wallets.analytics.whatIf.title') }}
      </summary>
      <div class="grid gap-2 pt-2">
        <UiTabs
          v-model="whatIf.kind"
          :items="(['expense', 'income'] as const).map(value => ({ label: t(`wallets.analytics.whatIf.${value}`), value }))"
          size="xs"
          variant="flat"
          :grow="false"
          :itemGrow="false"
          align="left"
        />
        <div class="grid grid-cols-2 gap-2">
          <FormInput v-model="whatIf.amount" type="number" :placeholder="t('wallets.analytics.whatIf.amount')" />
          <input v-model="whatIf.date" type="date" class="rounded-md bg-default px-2 text-sm ring ring-default" :aria-label="t('wallets.analytics.whatIf.date')">
          <FormInput v-model="whatIf.spendingPercent" type="number" :placeholder="t('wallets.analytics.whatIf.spendingPercent')" />
          <FormInput v-model="whatIf.incomePercent" type="number" :placeholder="t('wallets.analytics.whatIf.incomePercent')" />
        </div>
        <div v-if="whatIfResult" class="grid gap-1 text-sm" data-what-if-result>
          <div>
            {{ t('wallets.analytics.forecast.withoutIncome') }}: {{ runwayLabel(forecast.runwayWithoutIncome) }} → {{ runwayLabel(whatIfResult.runwayWithoutIncome) }}
          </div>
          <div>
            {{ t('wallets.analytics.forecast.withIncome') }}: {{ runwayLabel(forecast.runwayWithIncome) }} → {{ runwayLabel(whatIfResult.runwayWithIncome) }}
          </div>
        </div>
      </div>
    </details>

    <div class="min-h-44 min-w-0">
      <LazyStatChartAxisView
        v-if="isChartMountReady"
        isTooltipOnTap
        scaleMode="fit"
        :chartConfig
        chartType="line"
        period="month"
        :series="toChartSeries(chartSeries, currenciesStore.base)"
        :tooltipRows
        :xAxisLabels="forecast.months.map(month => month.start)"
      />
    </div>

    <div class="grid min-w-0 gap-1" data-analytics-cover>
      <UiText variant="caption" class="px-2">
        {{ t('wallets.analytics.cover.title') }}
      </UiText>
      <div class="min-h-40 min-w-0">
        <LazyStatChartAxisView
          v-if="isChartMountReady"
          isTooltipOnTap
          scaleMode="fit"
          :chartConfig="coverChartConfig"
          chartType="line"
          period="month"
          :series="coverSeries"
          :tooltipRows="coverTooltipRows"
          :xAxisLabels="cover.labels"
        />
      </div>
    </div>

    <WalletsAnalyticsForecastMonthsView
      :currencyCode="currenciesStore.base"
      :rows="monthRows"
      :scenario="view.scenario"
    />

    <div class="grid gap-2">
      <div class="flex items-center gap-2">
        <UiTitleSection size="sm" class="grow">
          {{ t('wallets.analytics.obligations.title') }}
        </UiTitleSection>
        <UButton to="/loans" color="neutral" variant="link" size="sm" trailingIcon="lucide:chevron-right">
          {{ t('wallets.analytics.debts.open') }}
        </UButton>
      </div>
      <WalletsAnalyticsSummaryTilesView
        v-if="upcomingTiles.length"
        :currencyCode="currenciesStore.base"
        :items="upcomingTiles"
      />
      <WalletsAnalyticsObligationsView
        :currencyCode="currenciesStore.base"
        :horizonLabel
        :items="obligationRows"
        @select="walletId => router.push(`/wallets/${walletId}`)"
      />
    </div>

    <div class="grid gap-2">
      <UiTitleSection size="sm">
        {{ t('wallets.analytics.regular.title') }}
      </UiTitleSection>
      <UiText variant="meta" class="px-2 leading-snug!">
        {{ t('wallets.analytics.regular.hint', { min: Math.min(settings.regularMinMonths, settings.historyMonths), window: settings.historyMonths }) }}
      </UiText>
      <WalletsAnalyticsRegularListView
        :currencyCode="currenciesStore.base"
        :items="regularItems"
        :windowMonths="settings.historyMonths"
        @edit="openEditor"
        @toggle="toggleRegular"
      />
    </div>

    <UiSheet
      v-if="editing"
      modalClass="max-w-md"
      :title="editing.name"
      @closed="editingId = null"
    >
      <template #default="{ close }">
        <div class="grid gap-4 pb-3">
          <UiText variant="meta" class="leading-snug!">
            {{ t('wallets.analytics.regular.detected') }}
            <Amount :amount="editing.detectedAmount" :currencyCode="currenciesStore.base" :isShowBaseRate="false" class="inline-grid" variant="compact" />
            · {{ editing.monthsWithSpending }}/{{ settings.historyMonths }}
          </UiText>

          <UiTabs
            v-model="draft.state"
            :items="(['auto', 'include', 'exclude'] as const).map(value => ({ label: t(`wallets.analytics.regular.states.${value}`), value }))"
            size="sm"
          />

          <div v-if="draft.state !== 'exclude'" class="grid gap-2">
            <UiText variant="meta">
              {{ t('wallets.analytics.regular.amount') }}
            </UiText>
            <FormInput
              v-model="draft.amount"
              type="number"
              :placeholder="String(minorToAmount(editing.detectedAmount, currenciesStore.base))"
            />
          </div>

          <div class="flex gap-2">
            <UButton color="neutral" variant="soft" block @click="close">
              {{ t('base.cancel') }}
            </UButton>
            <UButton block @click="saveEditor(close)">
              {{ t('base.save') }}
            </UButton>
          </div>
        </div>
      </template>
    </UiSheet>

    <UiSheet
      v-if="isWalletsOpen"
      modalClass="max-w-md"
      :title="t('wallets.analytics.forecast.startWallets')"
      @closed="isWalletsOpen = false"
    >
      <div class="grid pb-3">
        <UiSwitchItem
          v-for="walletId in availableWalletIds"
          :key="walletId"
          :checkboxValue="startWalletIds.includes(walletId)"
          :title="walletsStore.items?.[walletId]?.name ?? walletId"
          trailing
          @toggle="toggleStartWallet(walletId)"
        />
      </div>
    </UiSheet>
  </section>
</template>
