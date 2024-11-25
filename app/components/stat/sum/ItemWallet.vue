<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

const props = defineProps<{
  amount: number
  currencyCode?: string
  isActive?: boolean
  title?: string
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()

const currenciesStore = useCurrenciesStore()
</script>

<template>
  <UiBox2
    class="grow-0 py-1"
    @click="(e: Event) => emit('click', e)"
  >
    <UiTitle6>{{ props.title }}</UiTitle6>

    <Amount
      :amount="props.amount"
      :currencyCode="props.currencyCode || currenciesStore.base"
      align="left"
      variant="3xl"
    />
  </UiBox2>
</template>
