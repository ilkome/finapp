<script setup lang="ts">
import { TrnType } from '~/components/trns/types'

defineProps<{
  currencyCode: string
  expense: number
  income: number
}>()
</script>

<template>
  <Amount
    v-if="income !== 0"
    :amount="income"
    :currencyCode="currencyCode"
    :isShowBaseRate="false"
    :type="TrnType.Income"
    colorize="income"
    variant="row"
  />

  <Amount
    v-if="expense !== 0"
    :amount="expense"
    :currencyCode="currencyCode"
    :isShowBaseRate="false"
    :type="TrnType.Expense"
    isShowMinus
    variant="row"
  />
</template>
