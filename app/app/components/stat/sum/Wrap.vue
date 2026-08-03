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
  focusedType?: SeriesSlugSelected
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

const isShowAverage = computed(() => statConfig.config.value.average.isShow)

// Forecast row: shown only when forecast is on and the period actually has projected occurrences.
const isShowForecast = computed(() =>
  !!props.forecastMode && props.forecastMode !== 'off' && !!props.forecastTotal && props.forecastTotal.sum !== 0,
)
const projectedSum = computed(() => props.total.sum + (props.forecastTotal?.sum ?? 0))

const className = computed(() => cn(
  'flex min-h-10.5 min-w-min items-center',
  props.type === 'summary' && 'min-h-14',
  {
    interactive: props.type === 'summary',
  },
))

const summaryItems = computed<{ amount: number, isActive: boolean, type: SeriesSlugSelected }[]>(() => [
  { amount: -props.total.expense, isActive: props.filteredType === 'expense', type: 'expense' },
  { amount: props.total.income, isActive: props.filteredType === 'income', type: 'income' },
  { amount: props.total.sum, isActive: false, type: 'netIncome' },
])

function onClick(type: SeriesSlugSelected) {
  emit('click', type)
}
</script>

<template>
  <div class="overflow-x-auto">
    <div
      v-if="props.type === 'summary' && props.focusedType"
      class="relative flex h-14 w-full items-center rounded-sm interactive bg-elevated/30 px-3 py-0.5"
      @click="onClick(props.focusedType)"
    >
      <UiButtonClose class="top-1/2 right-3 -translate-y-1/2" @click.stop="onClick(props.focusedType)" />
      <StatSumItem
        :amount="props.focusedType === 'income' ? total.income : -total.expense"
        class="min-w-0 border-0! bg-transparent! p-0!"
        :type="props.focusedType"
      />
      <div class="mr-10 ml-auto flex w-12 shrink-0 items-center justify-center">
        <slot name="focusPie" />
      </div>
    </div>

    <div
      v-else-if="props.type === 'summary'"
      class="flex flex-wrap gap-2 @2xl/stat:justify-start"
    >
      <StatSumItem
        v-for="item in summaryItems"
        :key="item.type"
        :amount="item.amount"
        :isActive="item.isActive"
        :class="className"
        :type="item.type"
        @click="onClick(item.type)"
      >
        <StatSumAverage
          v-if="isShowAverage"
          :categoryId
          :trnsIds
          :walletId
          :statTabSlug="item.type"
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
        <StatSumAverage
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
      class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs text-muted"
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
      <span class="flex items-center gap-1 text-highlighted">
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
