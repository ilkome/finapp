<script setup lang="ts">
import type { MoneyTypeNumber, MoneyTypeSlug, MoneyTypeSlugSum } from '~/components/stat/types'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'

const props = defineProps<{
  hasBg?: boolean
  item: {
    amount: number
    averageAmount: number
    moneyTypeSlugSum: MoneyTypeSlugSum
    moneyTypeNumber: MoneyTypeNumber
    colorizeType: MoneyTypeSlug
    isShownAverage: boolean
  }
}>()

const emit = defineEmits<{
  click: []
}>()

const currenciesStore = useCurrenciesStore()

const classes = computed(() => ({
  'rounded-lg _bg-item-4 px-2 py-2 sm_px-1.5 sm_pt-3': props.hasBg,
}))
</script>

<template>
  <div
    class="flex-1"
    :class="classes"
    @click="emit('click')"
  >
    <UiTitle2>{{ $t(`money.${item.moneyTypeSlugSum}`) }}</UiTitle2>

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
