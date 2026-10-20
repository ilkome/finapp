<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import type { RatesMode } from '~/components/wallets/analytics/useAnalyticsBase'

import { analyticsRanges, useAnalyticsBase } from '~/components/wallets/analytics/useAnalyticsBase'

const { t } = useI18n()

useSeoMeta({
  ogTitle: t('wallets.analytics.title'),
  title: t('wallets.analytics.title'),
})

const base = useAnalyticsBase()
const isLoans = useFeature('loans')
const ratesItems = computed(() => (['historical', 'current'] as const).map(value => ({ label: t(`wallets.analytics.rates.${value}`), value })))
const rangeItems = computed(() => analyticsRanges.map(value => ({ label: t(`wallets.analytics.ranges.${value}`), value })))
</script>

<template>
  <UiPage>
    <UiHeader backTo="/wallets">
      <UiHeaderTitle>
        {{ t('wallets.analytics.title') }}
      </UiHeaderTitle>
    </UiHeader>

    <div class="grid max-w-5xl grow content-start gap-8 px-2 pb-10 lg:px-4 2xl:px-8 @3xl/page:grid-cols-2 @3xl/page:gap-x-12">
      <div class="flex flex-wrap items-center gap-2 @3xl/page:col-span-2" data-analytics-range>
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
      </div>

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

      <WalletsAnalyticsBalanceSection :base />
      <WalletsAnalyticsCashflowSection :base />
      <WalletsAnalyticsMoversSection :base />
      <WalletsAnalyticsWalletsTableSection :base />
      <WalletsAnalyticsDebtSection v-if="isLoans" :base />

      <!-- Snapshots of today: the range tabs above do not drive them. -->
      <div class="grid gap-1 border-t border-default pt-6 @3xl/page:col-span-2" data-analytics-now>
        <UiTitleSection>
          {{ t('wallets.analytics.now.title') }}
        </UiTitleSection>
        <UiText variant="meta" class="px-2">
          {{ t('wallets.analytics.now.caption') }}
        </UiText>
      </div>
      <WalletsAnalyticsForecastSection />
      <WalletsAnalyticsSharesSection :walletIds="base.walletIds.value" />
    </div>
  </UiPage>
</template>
