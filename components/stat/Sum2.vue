<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'

const props = defineProps<{
  amount: number
  title?: string
}>()

const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div class="grid gap-2">
    <UiTitle5>{{ props.title }}</UiTitle5>

    <Amount
      :amount="props.amount"
      :currencyCode="currenciesStore.base"
      align="left"
      variant="3xl"
    />
  </div>
</template>
