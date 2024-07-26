<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { getStyles } from '~/components/ui/getStyles'

const props = defineProps<{
  amount: number
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
    class="grow grid gap-1 px-3 py-2 border border-transparent"
    :class="[
      getStyles('item', ['bg', 'padding3', 'center', 'minh', 'minw1', 'rounded']), {
        '-bg-item-5 rounded !border-accent-1/80': props.isActive,
      },
    ]"
    @click="(e: Event) => emit('click', e)"
  >
    <UiTitle6>{{ props.title }}</UiTitle6>

    <Amount
      :amount="props.amount"
      :currencyCode="currenciesStore.base"
      align="left"
      variant="-3xl"
    />
  </div>
</template>
