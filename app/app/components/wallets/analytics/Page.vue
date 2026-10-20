<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import { useStorage } from '@vueuse/core'

import type { AnalyticsOption } from '~/components/wallets/analytics/SettingsMenu.vue'
import type { RatesMode } from '~/components/wallets/analytics/useAnalyticsBase'

import { analyticsRanges, useAnalyticsBase } from '~/components/wallets/analytics/useAnalyticsBase'
import { provideWalletSheet } from '~/components/wallets/useWalletSheet'
import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'

const { t } = useI18n()

useSeoMeta({
  ogTitle: t('wallets.analytics.title'),
  title: t('wallets.analytics.title'),
})

const base = useAnalyticsBase()
const isLoans = useFeature('loans')
const ratesItems = computed(() => (['historical', 'current'] as const).map(value => ({ label: t(`wallets.analytics.rates.${value}`), value })))
const includeArchived = useStorage<boolean>(WALLET_STORAGE_KEYS.includeArchivedInStats, false)
const includeExcluded = useStorage<boolean>(WALLET_STORAGE_KEYS.includeExcludedInStats, false)
// The same switches as the wallets page: totals, charts and the forecast's wallets all follow them.
const walletOptions = computed<AnalyticsOption[]>(() => ([
  ['includeArchived', 'includeArchivedInStats', includeArchived.value],
  ['includeExcluded', 'includeExcludedInStats', includeExcluded.value],
] as const).map(([id, label, isOn]) => ({
  id,
  items: (['off', 'on'] as const).map(value => ({ label: t(`wallets.analytics.include.${value}`), value })),
  label: t(`wallets.options.${label}`),
  value: isOn ? 'on' : 'off',
})))

function onWalletOption(id: string, value: number | string) {
  (id === 'includeArchived' ? includeArchived : includeExcluded).value = value === 'on'
}

const tabIds = ['capital', 'flow', 'forecast', 'structure'] as const
type TabId = typeof tabIds[number]
const route = useRoute()
const router = useRouter()
// The URL keeps the tab for back navigation; the device remembers the last one for a bare visit.
const lastTab = useStorage<TabId>(WALLET_STORAGE_KEYS.analyticsTab, 'capital')
const tab = computed<TabId>(() => {
  const value = route.query.tab
  return tabIds.includes(value as TabId) ? value as TabId : tabIds.includes(lastTab.value) ? lastTab.value : 'capital'
})
const tabItems = computed(() => tabIds.map(value => ({ label: t(`wallets.analytics.groups.${value}.title`), value })))

function setTab(value: TabId) {
  lastTab.value = value
  router.replace({ query: { ...route.query, tab: value } })
}

// A link into another tab (the KPI's forecast hint) lands before that tab renders; scroll once it has.
watch(() => route.hash, async (hash) => {
  if (!hash)
    return
  await nextTick()
  document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}, { immediate: true })

const walletSheet = provideWalletSheet()

const rangeItems = computed(() => analyticsRanges.map(value => ({ label: t(`wallets.analytics.ranges.${value}`), value })))
</script>

<template>
  <UiPage>
    <UiHeader backTo="/wallets">
      <UiHeaderTitle>
        {{ t('wallets.analytics.title') }}
      </UiHeaderTitle>

      <template #after>
        <div class="flex max-w-5xl flex-wrap items-center gap-2 px-2 lg:px-4 2xl:px-8" data-analytics-range>
          <!-- Forecast and structure are today's snapshot: the period controls do not drive them. -->
          <template v-if="tab === 'capital' || tab === 'flow'">
            <UiTabs
              :items="rangeItems"
              :modelValue="base.rangeId.value"
              size="sm"
              :grow="false"
              @update:modelValue="value => base.rangeId.value = value as typeof base.rangeId.value"
            />
            <StatChartIntervalSelect
              :period="base.effectivePeriod.value"
              :range="base.range.value"
              @changePeriod="(value: Period) => base.period.value = value"
            />
            <UiText variant="caption" class="ml-1">
              {{ t('wallets.analytics.rates.label') }}:
            </UiText>
            <UiTabs
              :items="ratesItems"
              :modelValue="base.ratesMode.value"
              size="xs"
              variant="flat"
              :grow="false"
              :itemGrow="false"
              :aria-label="t('wallets.analytics.rates.label')"
              @update:modelValue="value => base.ratesMode.value = value as RatesMode"
            />
          </template>
          <WalletsAnalyticsSettingsMenu
            class="ml-auto"
            :options="walletOptions"
            :title="t('wallets.analytics.walletsSettings')"
            @change="onWalletOption"
          />
        </div>
      </template>
    </UiHeader>

    <div class="grid max-w-5xl grow content-start gap-8 px-2 pb-10 lg:px-4 2xl:px-8 @3xl/page:grid-cols-2 @3xl/page:gap-x-12">
      <UAlert
        v-if="base.missingCurrencies.value.length"
        class="@3xl/page:col-span-2"
        color="warning"
        variant="subtle"
        icon="lucide:triangle-alert"
        :title="t('wallets.analytics.missingRates', { currencies: base.missingCurrencies.value.join(', ') })"
        :actions="[{ label: t('wallets.analytics.missingRatesLink'), to: '/currencies', variant: 'link', color: 'warning' }]"
        data-analytics-missing-rates
      />

      <WalletsAnalyticsKpiSection :base />

      <div class="grid gap-1 @3xl/page:col-span-2" data-analytics-tabs>
        <UiTabs
          :items="tabItems"
          :modelValue="tab"
          size="sm"
          @update:modelValue="value => setTab(value as TabId)"
        />
        <UiText variant="meta" class="px-2">
          {{ t(`wallets.analytics.groups.${tab}.caption`) }}
        </UiText>
      </div>

      <!-- Only the open tab is mounted, so the others are not computed. -->
      <template v-if="tab === 'capital'">
        <WalletsAnalyticsBalanceSection :base />
        <WalletsAnalyticsWalletsTableSection :base />
        <WalletsAnalyticsDebtSection v-if="isLoans" :base />
        <WalletsAnalyticsBankCheckSection :base />
      </template>
      <template v-else-if="tab === 'flow'">
        <WalletsAnalyticsCashflowSection :base />
        <WalletsAnalyticsMoversSection :base />
      </template>
      <WalletsAnalyticsForecastSection v-else-if="tab === 'forecast'" class="@3xl/page:col-span-2" />
      <WalletsAnalyticsSharesSection v-else :walletIds="base.walletIds.value" />
    </div>

    <WalletsSheet
      v-if="walletSheet"
      :key="walletSheet"
      :walletId="walletSheet"
      @closed="walletSheet = null"
    />
  </UiPage>
</template>
