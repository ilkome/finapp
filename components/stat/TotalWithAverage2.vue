<script setup lang="ts">
import type { MoneyTypeNumber, MoneyTypeSlug, MoneyTypeSlugSum } from '~/components/stat/types'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'

defineProps<{
  item: {
    amount: number
    averageAmount: number
    moneyTypeSlugSum: MoneyTypeSlugSum
    moneyTypeNumber: MoneyTypeNumber
    colorizeType: MoneyTypeSlug
    isShownAverage: boolean
  }
}>()

const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div class="flex-1">
    <UiTitle2 v-if="$slots.name">
      <slot name="name" />
    </UiTitle2>

    <div
      class="flex flex-wrap items-start gap-2 gap-x-4 overflow-hidden overflow-x-auto pt-2"
    >
      <!-- Total -->
      <div class="text-3xl">
        <Amount
          :amount="item.amount"
          :colorize="item.colorizeType"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :type="item.moneyTypeNumber"
        />
      </div>

      <!-- Average -->
      <div v-if="item.isShownAverage">
        <UiTextSmall>{{ $t(`money.average.${item.moneyTypeSlugSum}`) }}</UiTextSmall>
        <Amount
          :amount="item.averageAmount"
          :currencyCode="currenciesStore.base"
          :type="item.moneyTypeNumber"
          :colorize="item.colorizeType"
          :isShowBaseRate="false"
          :isShowSign="false"
        />
      </div>
    </div>
  </div>
</template>
