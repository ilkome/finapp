<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

const props = defineProps<{
  amount: number
  currencyCode?: string
  title?: string
}>()

const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div
    class="flex min-h-10.5 min-w-10.5 grow-0 items-center gap-1 py-1 lg:gap-1"
  >
    <UiText variant="caption">
      {{ props.title }}
    </UiText>

    <Amount
      :amount="props.amount"
      :currencyCode="props.currencyCode || currenciesStore.base"
      align="left"
      variant="summary"
    />
  </div>
</template>
