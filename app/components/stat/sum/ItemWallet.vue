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
  <div
    class="flex grid min-h-[42px] min-w-[42px] grow-0 items-center gap-1 py-1 lg:gap-1"
    @click="(e: Event) => emit('click', e)"
  >
    <UiTextSubtitle>{{ props.title }}</UiTextSubtitle>

    <Amount
      :amount="props.amount"
      :currencyCode="props.currencyCode || currenciesStore.base"
      align="left"
      variant="xl"
    />
  </div>
</template>
