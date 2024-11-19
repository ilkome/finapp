<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import type { MoneyTypeSlugNew } from '~/components/stat/types'

const props = defineProps<{
  amount: number
  currencyCode?: string
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
    class="grid gap-1 border border-transparent px-3 py-2"
    :class="{
      '!border-accent-1/40 !bg-item-9': props.isActive,
    }"
    @click="(e: Event) => emit('click', e)"
  >
    <UiTitle6>
      {{ props.isTotal ? $t('money.all') : '' }}
      {{ $t(`money.${props.type}`) }}
    </UiTitle6>

    <Amount
      :amount="props.amount"
      :currencyCode="props.currencyCode || currenciesStore.base"
      align="left"
      variant="xl"
      :class="{
        '!text-income-1': props.amount > 0 && type !== 'sum',
        '!text-expense-1': props.amount < 0 && type !== 'sum',
      }"
    />
  </div>
</template>
