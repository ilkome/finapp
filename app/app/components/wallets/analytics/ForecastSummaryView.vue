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
    <button
      type="button"
      class="grid gap-1 rounded-md interactive bg-elevated/30 px-3 py-2.5 text-left"
      data-forecast-start
      @click="emit('editWallets')"
    >
      <UiText variant="caption">
        {{ t('wallets.analytics.forecast.startBalance') }}
      </UiText>
      <Amount
        :amount="props.startBalance"
        :currencyCode="props.currencyCode"
        :isShowBaseRate="false"
        align="left"
        variant="summary"
      />
    </button>

    <div class="grid grid-cols-2 gap-2">
      <div
        v-for="scenario in scenarios"
        :key="scenario.id"
        class="grid content-start gap-1.5 rounded-md bg-elevated/30 px-3 py-2.5"
        :data-forecast-runway="scenario.id"
      >
        <UiText variant="caption">
          {{ scenario.title }}
        </UiText>

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
      </div>
    </div>

    <UiText v-if="props.note" variant="meta" class="px-2 leading-snug!" data-forecast-note>
      {{ props.note }}
    </UiText>

    <div class="grid gap-1 rounded-md bg-elevated/30 px-3 py-2.5">
      <UiText variant="caption" class="pb-1">
        {{ t('wallets.analytics.forecast.perMonth') }}
      </UiText>

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
    </div>
  </div>
</template>
