<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import { useStorage } from '@vueuse/core'

import type { AnalyticsOption } from '~/components/wallets/analytics/SettingsMenu.vue'
import type { RatesMode } from '~/components/wallets/analytics/useAnalyticsBase'

import { analyticsRanges, useAnalyticsBase } from '~/components/wallets/analytics/useAnalyticsBase'
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

// Collapsed groups are not mounted, so their sections are not computed either.
const collapsed = useStorage(WALLET_STORAGE_KEYS.analyticsCollapsed, { capital: false, flow: false, now: false }, localStorage, { mergeDefaults: true })
function toggleGroup(id: keyof typeof collapsed.value) {
  collapsed.value = { ...collapsed.value, [id]: !collapsed.value[id] }
}

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

      <WalletsAnalyticsGroupTitle
        :title="t('wallets.analytics.groups.capital.title')"
        :caption="t('wallets.analytics.groups.capital.caption')"
        :isCollapsed="collapsed.capital"
        @toggle="toggleGroup('capital')"
      />
      <template v-if="!collapsed.capital">
        <WalletsAnalyticsBalanceSection :base />
        <WalletsAnalyticsWalletsTableSection :base />
        <WalletsAnalyticsDebtSection v-if="isLoans" :base />
        <WalletsAnalyticsBankCheckSection :base />
      </template>

      <WalletsAnalyticsGroupTitle
        :title="t('wallets.analytics.groups.flow.title')"
        :caption="t('wallets.analytics.groups.flow.caption')"
        :isCollapsed="collapsed.flow"
        @toggle="toggleGroup('flow')"
      />
      <template v-if="!collapsed.flow">
        <WalletsAnalyticsCashflowSection :base />
        <WalletsAnalyticsMoversSection :base />
      </template>

      <!-- Snapshots of today: the range tabs above do not drive them. -->
      <WalletsAnalyticsGroupTitle
        :title="t('wallets.analytics.now.title')"
        :caption="t('wallets.analytics.now.caption')"
        :isCollapsed="collapsed.now"
        @toggle="toggleGroup('now')"
      />
      <template v-if="!collapsed.now">
        <WalletsAnalyticsForecastSection />
        <WalletsAnalyticsSharesSection :walletIds="base.walletIds.value" />
      </template>
    </div>
  </UiPage>
</template>
