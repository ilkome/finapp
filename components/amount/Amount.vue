<script setup lang="ts">
import { formatAmount, getCurrencySymbol } from '~/components/amount/formatAmount'
import useAmount from '~/components/amount/useAmount'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'

const props = withDefaults(
  defineProps<{
    align?: 'left' | 'center' | 'right'
    amount: number
    colorize?: MoneyTypeSlug
    currencyCode: string
    isShowBaseRate?: boolean
    isShowMinus?: boolean
    isShowPlus?: boolean
    isShowSign?: boolean
    type?: MoneyTypeNumber
    variant?: '2xs' | '3xl' | 'base'
  }>(),
  {
    align: 'right',
    isShowBaseRate: true,
    isShowSign: true,
    variant: 'base',
  },
)

const emit = defineEmits<{
  click: [e: Event]
}>()

const { baseCurrencyCode, getAmountInBaseRate } = useAmount()
</script>

<template>
  <div
    :class="{
      '!text-expense': props.colorize === 'expense' && props.type === 0,
      '!text-income': props.colorize === 'income' && props.type === 1,
      'text-2xs': props.variant === '2xs',
      'text-3xl': props.variant === '3xl',
      'text-base': props.variant === 'base',
    }"
    class="
      flex flex-col gap-1
      font-secondary text-primary leading-none
    "
    @click="e => emit('click', e)"
  >
    <AmountItem
      v-if="amount === 0"
      :align="props.align"
      :amount="formatAmount(amount, currencyCode)"
      :symbol="getCurrencySymbol(props.currencyCode)"
    />

    <template v-if="amount !== 0">
      <AmountItem
        :align="props.align"
        :amount="formatAmount(amount, currencyCode)"
        :isShowMinus="props.isShowMinus"
        :isShowPlus="props.isShowPlus"
        :symbol="getCurrencySymbol(props.currencyCode)"
      />

      <AmountItem
        v-if="isShowBaseRate && currencyCode !== baseCurrencyCode"
        :align="props.align"
        :amount="getAmountInBaseRate({ amount, currencyCode })"
        :isShowMinus="props.isShowMinus"
        :isShowPlus="props.isShowPlus"
        :symbol="getCurrencySymbol(baseCurrencyCode)"
        class="text-xs opacity-70"
      />
    </template>
  </div>
</template>
