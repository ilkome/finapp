<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import type { MoneyTypeSlugNew } from '~/components/stat/types'

const props = defineProps<{
  amount: number
  isActive?: boolean
  isTotal?: boolean
  type: MoneyTypeSlugNew
}>()

const emit = defineEmits<{
  click: [e: Event]
}>()

const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div
    class="grid gap-1 px-3 py-2 border border-transparent"
    :class="{
      '-bg-item-5 rounded !border-accent-1/80': props.isActive,
    }"
    @click="(e: Event) => emit('click', e)"
  >
    <UiTitle6>
      {{ props.isTotal ? $t('money.all') : '' }}
      {{ $t(`money.${props.type}`) }}
    </UiTitle6>

    <Amount
      :amount="props.amount"
      :currencyCode="currenciesStore.base"
      align="left"
      variant="-3xl"
      :class="{
        '!text-income-1': props.amount > 0 && type !== 'sum',
        '!text-expense-1': props.amount < 0 && type !== 'sum',
      }"
    />
  </div>
</template>
