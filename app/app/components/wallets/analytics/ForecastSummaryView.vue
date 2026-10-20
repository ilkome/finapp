<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

export type ForecastRunway = {
  /** Run-out day, formatted; null when the money lasts past the horizon. */
  dateLabel: string | null
  /** Duration until then, formatted ("4 months"). */
  durationLabel: string | null
}

const props = defineProps<{
  currencyCode: CurrencyCode
  horizonLabel: string
  monthlyIncome: number
  monthlyObligations: number
  monthlyRegular: number
  /** Expected date of the next income, formatted; absent without a pay-day schedule. */
  nextIncomeLabel?: string | null
  /** Why both scenarios run out on the same day. */
  note?: string | null
  runwayWithIncome: ForecastRunway
  runwayWithoutIncome: ForecastRunway
  startBalance: number
}>()

const emit = defineEmits<{
  editWallets: []
}>()

const { t } = useI18n()

const scenarios = computed(() => [
  { id: 'withoutIncome', runway: props.runwayWithoutIncome, title: t('wallets.analytics.forecast.withoutIncome') },
  { id: 'withIncome', runway: props.runwayWithIncome, title: t('wallets.analytics.forecast.withIncome') },
])
</script>

<template>
  <div class="grid gap-3" data-forecast-summary>
    <UiCard
      as="button"
      chevron="more"
      :title="t('wallets.analytics.forecast.startBalance')"
      data-forecast-start
      @click="emit('editWallets')"
    >
      <Amount
        :amount="props.startBalance"
        :currencyCode="props.currencyCode"
        :isShowBaseRate="false"
        align="left"
        variant="summary"
      />
    </UiCard>

    <div class="grid grid-cols-2 gap-2">
      <UiCard
        v-for="scenario in scenarios"
        :key="scenario.id"
        class="gap-1.5"
        :title="scenario.title"
        :data-forecast-runway="scenario.id"
      >
        <template v-if="scenario.runway.dateLabel">
          <div class="text-base leading-none font-semibold" :class="scenario.runway.durationLabel ? 'text-highlighted' : 'text-error'">
            {{ scenario.runway.durationLabel ?? t('wallets.analytics.forecast.runOut') }}
          </div>
          <UiText variant="meta">
            {{ t('wallets.analytics.forecast.until') }} {{ scenario.runway.dateLabel }}
          </UiText>
        </template>

        <template v-else>
          <div class="text-base leading-none font-semibold text-income-1">
            {{ t('wallets.analytics.forecast.enough') }}
          </div>
          <UiText variant="meta">
            {{ props.horizonLabel }}
          </UiText>
        </template>
      </UiCard>
    </div>

    <UiText v-if="props.note" variant="meta" class="px-2 leading-snug!" data-forecast-note>
      {{ props.note }}
    </UiText>

    <UiCard :title="t('wallets.analytics.forecast.perMonth')">
      <div class="flex items-center justify-between gap-3 text-sm text-muted">
        {{ t('wallets.analytics.forecast.regular') }}
        <Amount :amount="-props.monthlyRegular" :currencyCode="props.currencyCode" :isShowBaseRate="false" variant="row" />
      </div>
      <div class="flex items-center justify-between gap-3 text-sm text-muted">
        {{ t('wallets.analytics.forecast.obligations') }}
        <Amount :amount="-props.monthlyObligations" :currencyCode="props.currencyCode" :isShowBaseRate="false" variant="row" />
      </div>
      <div class="flex items-center justify-between gap-3 text-sm text-muted">
        {{ t('wallets.analytics.forecast.income') }}
        <Amount :amount="props.monthlyIncome" :currencyCode="props.currencyCode" :isShowBaseRate="false" isShowPlus variant="row" />
      </div>
      <UiText v-if="props.nextIncomeLabel" variant="meta" data-forecast-next-income>
        {{ t('wallets.analytics.forecast.nextIncome') }} {{ props.nextIncomeLabel }}
      </UiText>
    </UiCard>
  </div>
</template>
