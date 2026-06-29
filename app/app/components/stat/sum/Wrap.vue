<script setup lang="ts">
import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryId } from '~/components/categories/types'
import type { ForecastMode } from '~/components/recurrences/useForecastMode'
import type { SeriesSlugSelected, StatTabSlug } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { statConfigKey } from '~/components/stat/injectionKeys'

const props = defineProps<{
  averageTotal?: Record<string, number>
  categoryId?: CategoryId
  filteredType: SeriesSlugSelected
  forecastMode?: ForecastMode
  forecastTotal?: TotalReturns
  total: TotalReturns
  trnsIds: TrnId[]
  type: SeriesSlugSelected | StatTabSlug
  walletId?: WalletId
}>()

const emit = defineEmits<{
  click: [type: SeriesSlugSelected]
  clickAverage: []
}>()

const { t } = useI18n()
const statConfig = inject(statConfigKey)!
const currenciesStore = useCurrenciesStore()

const isShowAverage = computed(() => statConfig.config.value.statAverage.isShow)

// Forecast row: shown only when forecast is on and the period actually has projected occurrences.
const isShowForecast = computed(() =>
  !!props.forecastMode && props.forecastMode !== 'off' && !!props.forecastTotal && props.forecastTotal.sum !== 0,
)
const projectedSum = computed(() => props.total.sum + (props.forecastTotal?.sum ?? 0))

const className = computed(() => cn(
  'min-w-min min-h-[42px] flex items-center',
  {
    interactive: props.type === 'summary',
  },
))

function onClick(type: SeriesSlugSelected) {
  emit('click', type)
}
</script>

<template>
  <div class="overflow-x-auto">
    <div
      v-if="props.type === 'summary'"
      class="flex flex-wrap gap-2 @2xl/stat:justify-start"
    >
      <StatSumItem
        :amount="-total.expense"
        :isActive="filteredType === 'expense'"
        :class="className"
        type="expense"
        @click="onClick('expense')"
      >
        <StatAverage
          v-if="isShowAverage"
          :categoryId
          :trnsIds
          :walletId
          statTabSlug="expense"
        />
      </StatSumItem>

      <StatSumItem
        :amount="total.income"
        :isActive="filteredType === 'income'"
        :class="className"
        type="income"
        @click="onClick('income')"
      >
        <StatAverage
          v-if="isShowAverage"
          :categoryId
          :trnsIds
          :walletId
          statTabSlug="income"
        />
      </StatSumItem>

      <StatSumItem
        :amount="total.sum"
        :class="className"
        type="netIncome"
        @click="onClick('netIncome')"
      >
        <StatAverage
          v-if="isShowAverage"
          :categoryId
          :trnsIds
          :walletId
          statTabSlug="netIncome"
        />
      </StatSumItem>
    </div>

    <div v-else class="flex items-center justify-start">
      <StatSumItem
        :amount="props.type === 'income' ? total.income : -((total as Record<string, number>)[props.type]!)"
        :class="className"
        :type="(props.type as SeriesSlugSelected)"
        :averageTotal="isShowAverage ? props.averageTotal : undefined"
        plain
        @click="emit('clickAverage')"
      >
        <StatAverage
          v-if="isShowAverage"
          :categoryId
          :statTabSlug="(props.type ?? 'netIncome') as SeriesSlugSelected"
          :trnsIds
          :walletId
        />
      </StatSumItem>
    </div>

    <div
      v-if="isShowForecast"
      class="text-2xs text-muted mt-1 flex flex-wrap items-center gap-x-3 gap-y-1"
    >
      <span class="tracking-wide uppercase">{{ t('stat.forecast.title') }}</span>
      <span v-if="forecastMode === 'separate'" class="flex items-center gap-1">
        {{ t('stat.forecast.short') }}
        <Amount
          :amount="forecastTotal!.sum"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :isShowPlus="forecastTotal!.sum > 0"
          align="left"
          variant="xs"
        />
      </span>
      <span class="text-highlighted flex items-center gap-1">
        {{ t('stat.forecast.projected') }}
        <Amount
          :amount="projectedSum"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          align="left"
          variant="xs"
        />
      </span>
    </div>
  </div>
</template>
