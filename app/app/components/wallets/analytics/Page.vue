<script setup lang="ts">
import type { Period } from '~~/utils/date/types'

import { analyticsRanges, useAnalyticsBase } from '~/components/wallets/analytics/useAnalyticsBase'

const { t } = useI18n()

useSeoMeta({
  ogTitle: t('wallets.analytics.title'),
  title: t('wallets.analytics.title'),
})

const base = useAnalyticsBase()
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
      </div>

      <WalletsAnalyticsBalanceSection :base />
      <WalletsAnalyticsCashflowSection :base />
      <WalletsAnalyticsForecastSection class="@3xl/page:row-span-2" />
      <WalletsAnalyticsSharesSection :walletIds="base.walletIds.value" />
    </div>
  </UiPage>
</template>
