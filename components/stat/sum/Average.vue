<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import type { MoneyTypeNumber } from '~/components/stat/types'

defineProps<{
  amount: number
  title: string
  type?: MoneyTypeNumber
}>()

const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div>
    <UiTextSmall>{{ title }}</UiTextSmall>
    <Amount
      :amount="amount"
      :currencyCode="currenciesStore.base"
      :type="type"
      :colorize="type === 0 ? 'expense' : 'income'"
      :isShowBaseRate="false"
      :isShowSign="false"
    />
  </div>
</template>
