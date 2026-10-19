<script setup lang="ts">
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
    type="income"
    colorize="income"
    variant="row"
  />

  <Amount
    v-if="expense !== 0"
    :amount="expense"
    :currencyCode="currencyCode"
    :isShowBaseRate="false"
    type="expense"
    isShowMinus
    variant="row"
  />
</template>
