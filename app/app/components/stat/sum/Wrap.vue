<script setup lang="ts">
import type { TotalReturns } from '~/components/amount/getTotal'
import type { CategoryId } from '~/components/categories/types'
import type { ForecastMode } from '~/components/recurrences/useForecastMode'
import type { SeriesSlugSelected } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { statConfigKey } from '~/components/stat/injectionKeys'
import { buildStatSummaryItems } from '~/components/stat/sum/summaryItems'

const props = defineProps<{
  averageTotal?: Record<string, number>
  categoryId?: CategoryId
  filteredType: SeriesSlugSelected
  focusedType?: SeriesSlugSelected
  forecastMode?: ForecastMode
  forecastTotal?: TotalReturns
  total: TotalReturns
  trnsIds: TrnId[]
  type: SeriesSlugSelected | 'summary'
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
  !!props.forecastMode && props.forecastMode !== 'off' && !!props.forecastTotal && props.forecastTotal.net !== 0,
)
const isForecastEnabled = computed(() => !!props.forecastMode && props.forecastMode !== 'off')
const projectedNet = computed(() => props.total.net + (props.forecastTotal?.net ?? 0))

const className = computed(() => cn(
  'flex min-h-10.5 min-w-min items-center',
  props.type === 'summary' && 'flex-1 @2xl/stat:max-w-max',
  {
    interactive: props.type === 'summary',
  },
))

const summaryItems = computed(() => buildStatSummaryItems(props.total, props.filteredType))

function onClick(type: SeriesSlugSelected) {
  emit('click', type)
}
</script>

<template>
  <div class="overflow-x-auto">
    <StatSumItem
      v-if="props.type === 'summary' && props.focusedType"
      :amount="props.focusedType === 'income' ? total.income : -total.expense"
      class="w-full @2xl/stat:hidden"
      :type="props.focusedType"
      variant="summary"
      @click="onClick(props.focusedType)"
    >
      <UiButtonClose class="top-1/2 right-3 -translate-y-1/2" @click.stop="onClick(props.focusedType)" />
      <div class="mr-10 ml-auto flex w-12 shrink-0 items-center justify-center">
        <slot name="focusPie" />
      </div>
    </StatSumItem>

    <div
      v-if="props.type === 'summary'"
      :class="props.focusedType ? 'hidden @2xl/stat:flex' : 'flex'"
      class="flex-wrap gap-2 @2xl/stat:justify-start"
    >
      <StatSumItem
        v-for="item in summaryItems"
        :key="item.type"
        :amount="item.amount"
        :isActive="item.isActive"
        :class="className"
        :type="item.type"
        variant="summary"
        @click="onClick(item.type)"
      >
        <StatSumAverage
          v-if="isShowAverage"
          :categoryId
          :trnsIds
          :walletId
          :statTabSlug="item.type"
        />

        <div class="ml-auto hidden w-12 shrink-0 items-center justify-center @2xl/stat:flex">
          <slot name="summaryPie" :type="item.type" />
        </div>
      </StatSumItem>
    </div>

    <div v-else class="flex items-center justify-start">
      <StatSumItem
        :amount="props.type === 'income' ? total.income : -((total as Record<string, number>)[props.type]!)"
        class="w-full"
        :class="className"
        :type="(props.type as SeriesSlugSelected)"
        :averageTotal="isShowAverage ? props.averageTotal : undefined"
        variant="summary"
        @click="emit('clickAverage')"
      >
        <StatSumAverage
          v-if="isShowAverage"
          :categoryId
          :statTabSlug="(props.type ?? 'net') as SeriesSlugSelected"
          :trnsIds
          :walletId
        />

        <div
          v-if="props.type === 'expense' || props.type === 'income'"
          class="ml-auto flex w-12 shrink-0 items-center justify-center"
        >
          <slot name="summaryPie" :type="props.type" />
        </div>
      </StatSumItem>
    </div>

    <div
      v-if="isForecastEnabled"
      :aria-hidden="isShowForecast ? undefined : true"
      :class="!isShowForecast && 'invisible'"
      class="mt-1 grid grid-cols-1 items-center gap-x-3 gap-y-1 overflow-x-auto text-2xs text-muted @xl/stat:auto-cols-max @xl/stat:grid-flow-col @xl/stat:grid-cols-none"
    >
      <span class="tracking-wide uppercase">{{ t('stat.forecast.title') }}</span>
      <span v-if="forecastMode === 'separate'" class="flex items-center gap-1">
        {{ t('stat.forecast.short') }}
        <Amount
          :amount="forecastTotal?.net ?? 0"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :isShowPlus="(forecastTotal?.net ?? 0) > 0"
          align="left"
          variant="xs"
        />
      </span>
      <span class="flex items-center gap-1 text-highlighted">
        {{ t('stat.forecast.projected') }}
        <Amount
          :amount="projectedNet"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          align="left"
          variant="xs"
        />
      </span>
    </div>
  </div>
</template>
