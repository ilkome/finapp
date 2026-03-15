<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { TrnType } from '~/components/trns/types'

defineProps<{
  expense: number
  income: number
}>()

const currenciesStore = useCurrenciesStore()
</script>

<template>
  <Amount
    v-if="income !== 0"
    :amount="income"
    :currencyCode="currenciesStore.base"
    :isShowBaseRate="false"
    :type="TrnType.Income"
    colorize="income"
    variant="sm"
  />

  <Amount
    v-if="expense !== 0"
    :amount="expense"
    :currencyCode="currenciesStore.base"
    :isShowBaseRate="false"
    :type="TrnType.Expense"
    isShowMinus
    variant="sm"
  />
</template>
