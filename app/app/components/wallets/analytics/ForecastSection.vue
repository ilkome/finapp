<script setup lang="ts">
import { useStorage } from '@vueuse/core'
import { formatByLocale } from '~~/utils/date/civil'

import type { ChartSeries } from '~/components/stat/types'
import type { ForecastMonthRow, ForecastScenario } from '~/components/wallets/analytics/ForecastMonthsView.vue'
import type { AmountMode, RegularOverride } from '~/components/wallets/analytics/forecastSettings'
import type { ObligationRow } from '~/components/wallets/analytics/ObligationsView.vue'
import type { RegularListItem } from '~/components/wallets/analytics/RegularListView.vue'
import type { AnalyticsOption } from '~/components/wallets/analytics/SettingsMenu.vue'

import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { defaultConfig } from '~/components/stat/config/schema'
import { amountModes } from '~/components/wallets/analytics/forecastSettings'
import { useForecast } from '~/components/wallets/analytics/useForecast'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const { t } = useI18n()
const router = useRouter()
const dateLocale = useDateLocale()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const currenciesStore = useCurrenciesStore()
const isChartMountReady = useIdleMount()
const { availableWalletIds, forecast, income, obligations, regular, runwayOf, settings, startWalletIds, update } = useForecast()

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

const chartSeries = computed<ChartSeries[]>(() => [
  ...(view.value.scenario !== 'withIncome'
    ? [{ color: 'var(--color-expense-1)', data: forecast.value.months.map(m => m.endWithoutIncome), name: t('wallets.analytics.forecast.withoutIncome'), type: 'line' as const }]
    : []),
  ...(view.value.scenario !== 'withoutIncome'
    ? [{ color: 'var(--color-income-1)', data: forecast.value.months.map(m => m.endWithIncome), name: t('wallets.analytics.forecast.withIncome'), type: 'line' as const }]
    : []),
])
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

function setOverride(categoryId: string, override: RegularOverride | undefined) {
  const overrides = { ...settings.value.overrides }
  if (override)
    overrides[categoryId] = override
  else
    delete overrides[categoryId]
  update({ overrides })
}

// The switch flips the category; flipping it back to what detection says drops the manual entry.
function toggleRegular(categoryId: string) {
  const item = regular.value.find(entry => entry.categoryId === categoryId)
  if (!item)
    return
  const nextRegular = !item.isRegular
  if (nextRegular === item.isAuto && item.override?.amount === undefined)
    setOverride(categoryId, undefined)
  else
    setOverride(categoryId, { ...item.override, state: nextRegular ? 'include' : 'exclude' })
}

const editingId = ref<string | null>(null)
const editing = computed(() => regularItems.value.find(item => item.categoryId === editingId.value))
const draft = ref<{ amount: string, state: 'auto' | 'exclude' | 'include' }>({ amount: '', state: 'auto' })

function openEditor(categoryId: string) {
  const override = settings.value.overrides[categoryId]
  draft.value = { amount: override?.amount === undefined ? '' : String(override.amount), state: override?.state ?? 'auto' }
  editingId.value = categoryId
}

function saveEditor(close: () => void) {
  const id = editingId.value
  if (!id)
    return
  const amount = Number.parseFloat(draft.value.amount.replace(',', '.'))
  const hasAmount = Number.isFinite(amount) && amount >= 0
  if (draft.value.state === 'exclude')
    setOverride(id, { state: 'exclude' })
  else if (draft.value.state === 'include' || hasAmount)
    setOverride(id, { ...(hasAmount ? { amount } : {}), state: 'include' })
  else
    setOverride(id, undefined)
  close()
}

const isWalletsOpen = ref(false)
function toggleWallet(walletId: string) {
  const current = new Set(settings.value.walletIds.length ? settings.value.walletIds : startWalletIds.value)
  if (current.has(walletId))
    current.delete(walletId)
  else
    current.add(walletId)
  if (!current.size)
    return
  // Every wallet picked is the default, stored as an empty list so new wallets join on their own.
  const ids = availableWalletIds.value.filter(id => current.has(id))
  update({ walletIds: ids.length === availableWalletIds.value.length ? [] : ids })
}

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
    id: 'cardPayment',
    items: (['min', 'full'] as const).map(value => ({ label: t(`wallets.analytics.forecast.cardPayment.${value}`), value })),
    label: t('wallets.analytics.forecast.cardPayment.label'),
    value: settings.value.cardPayment,
  },
  {
    id: 'windowMonths',
    items: [3, 6, 12].map(value => ({ label: String(value), value })),
    label: t('wallets.analytics.regular.windowMonths'),
    value: settings.value.windowMonths,
  },
  {
    id: 'minMonths',
    items: Array.from({ length: settings.value.windowMonths }, (_, index) => index + 1)
      .filter(value => value >= Math.ceil(settings.value.windowMonths / 2))
      .map(value => ({ label: String(value), value })),
    label: t('wallets.analytics.regular.minMonths'),
    value: Math.min(settings.value.minMonths, settings.value.windowMonths),
  },
  {
    id: 'amountMode',
    items: amountModes.map(value => ({ label: t(`wallets.analytics.regular.amountModes.${value}`), value })),
    label: t('wallets.analytics.regular.amountMode'),
    value: settings.value.amountMode,
  },
  {
    id: 'groupByParent',
    items: [{ label: t('wallets.analytics.regular.byCategory'), value: 'no' }, { label: t('wallets.analytics.regular.byParent'), value: 'yes' }],
    label: t('wallets.analytics.regular.groupBy'),
    value: settings.value.groupByParent ? 'yes' : 'no',
  },
])

function onSetting(id: string, value: number | string) {
  if (id === 'scenario')
    view.value = { ...view.value, scenario: value as ForecastScenario }
  else if (id === 'groupByParent')
    update({ groupByParent: value === 'yes' })
  else if (id === 'windowMonths')
    update({ minMonths: Math.min(settings.value.minMonths, Number(value)), windowMonths: Number(value) })
  else if (id === 'amountMode')
    update({ amountMode: value as AmountMode })
  else if (id === 'cardPayment')
    update({ cardPayment: value as 'full' | 'min' })
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
      <WalletsAnalyticsSettingsMenu
        :options="settingsOptions"
        :title="t('wallets.analytics.forecast.title')"
        @change="onSetting"
      />
    </div>

    <WalletsAnalyticsForecastSummaryView
      :currencyCode="currenciesStore.base"
      :horizonLabel
      :monthlyIncome="income"
      :monthlyObligations="typicalMonth?.obligations ?? 0"
      :monthlyRegular="typicalMonth?.regular ?? 0"
      :runwayWithIncome="runwayOf(forecast.runwayWithIncome)"
      :runwayWithoutIncome="runwayOf(forecast.runwayWithoutIncome)"
      :startBalance="forecast.startBalance"
      @editWallets="isWalletsOpen = true"
    />

    <div class="min-h-44 min-w-0">
      <LazyStatChartAxisView
        v-if="isChartMountReady"
        :chartConfig
        chartType="line"
        period="month"
        :series="chartSeries"
        :xAxisLabels="forecast.months.map(month => month.start)"
      />
    </div>

    <WalletsAnalyticsForecastMonthsView
      :currencyCode="currenciesStore.base"
      :rows="monthRows"
      :scenario="view.scenario"
    />

    <div class="grid gap-2">
      <UiTitleSection size="sm">
        {{ t('wallets.analytics.obligations.title') }}
      </UiTitleSection>
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
        {{ t('wallets.analytics.regular.hint', { min: Math.min(settings.minMonths, settings.windowMonths), window: settings.windowMonths }) }}
      </UiText>
      <WalletsAnalyticsRegularListView
        :currencyCode="currenciesStore.base"
        :items="regularItems"
        :windowMonths="settings.windowMonths"
        @edit="openEditor"
        @toggle="toggleRegular"
      />
    </div>

    <WalletsAnalyticsEditorSheet
      v-if="editing"
      :title="editing.name"
      @closed="editingId = null"
    >
      <template #default="{ close }">
        <div class="grid gap-4 pb-3">
          <UiText variant="meta" class="leading-snug!">
            {{ t('wallets.analytics.regular.detected') }}
            <Amount :amount="editing.detectedAmount" :currencyCode="currenciesStore.base" :isShowBaseRate="false" class="inline-grid" variant="compact" />
            · {{ editing.monthsWithSpending }}/{{ settings.windowMonths }}
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
              :placeholder="String(Math.round(editing.detectedAmount))"
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
    </WalletsAnalyticsEditorSheet>

    <WalletsAnalyticsEditorSheet
      v-if="isWalletsOpen"
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
          @toggle="toggleWallet(walletId)"
        />
      </div>
    </WalletsAnalyticsEditorSheet>
  </section>
</template>
