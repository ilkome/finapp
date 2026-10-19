<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

export type ForecastMonthRow = {
  endWithIncome: number
  endWithoutIncome: number
  income: number
  key: number
  label: string
  obligations: number
  regular: number
}

export type ForecastScenario = 'both' | 'withIncome' | 'withoutIncome'

const props = defineProps<{
  currencyCode: CurrencyCode
  rows: ForecastMonthRow[]
  scenario: ForecastScenario
}>()

const { t } = useI18n()
</script>

<template>
  <div class="grid rounded-md bg-elevated/30 py-px" data-forecast-months>
    <div
      v-for="(row, index) in props.rows"
      :key="row.key"
      class="grid gap-1.5 px-3 py-2"
      :class="index !== props.rows.length - 1 && 'border-b border-default/60'"
      :data-forecast-month="row.key"
    >
      <div class="flex items-baseline gap-3">
        <div class="grow text-sm leading-none font-medium text-toned">
          {{ row.label }}
        </div>

        <div v-if="props.scenario !== 'withIncome'" class="grid justify-items-end gap-0.5">
          <UiText v-if="props.scenario === 'both'" variant="caption">
            {{ t('wallets.analytics.forecast.withoutIncomeShort') }}
          </UiText>
          <Amount
            :amount="row.endWithoutIncome"
            :class="row.endWithoutIncome < 0 && 'text-error!'"
            :currencyCode="props.currencyCode"
            :isShowBaseRate="false"
            variant="row"
          />
        </div>

        <div v-if="props.scenario !== 'withoutIncome'" class="grid justify-items-end gap-0.5">
          <UiText v-if="props.scenario === 'both'" variant="caption">
            {{ t('wallets.analytics.forecast.withIncomeShort') }}
          </UiText>
          <Amount
            :amount="row.endWithIncome"
            :class="row.endWithIncome < 0 && 'text-error!'"
            :currencyCode="props.currencyCode"
            :isShowBaseRate="false"
            variant="row"
          />
        </div>
      </div>

      <div class="flex flex-wrap gap-x-3 gap-y-1 text-2xs leading-none text-muted">
        <span class="flex items-center gap-1">
          {{ t('wallets.analytics.forecast.regular') }}
          <Amount :amount="-row.regular" :currencyCode="props.currencyCode" :isShowBaseRate="false" variant="secondary" />
        </span>
        <span v-if="row.obligations" class="flex items-center gap-1">
          {{ t('wallets.analytics.forecast.obligations') }}
          <Amount :amount="-row.obligations" :currencyCode="props.currencyCode" :isShowBaseRate="false" variant="secondary" />
        </span>
        <span v-if="props.scenario !== 'withoutIncome' && row.income" class="flex items-center gap-1">
          {{ t('wallets.analytics.forecast.income') }}
          <Amount :amount="row.income" :currencyCode="props.currencyCode" :isShowBaseRate="false" isShowPlus variant="secondary" />
        </span>
      </div>
    </div>
  </div>
</template>
