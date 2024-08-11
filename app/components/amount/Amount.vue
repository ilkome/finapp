<script setup lang="ts">
import { formatAmount, getCurrencySymbol } from '~/components/amount/formatAmount'
import useAmount from '~/components/amount/useAmount'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'
import type { CurrencyCode } from '~/components/currencies/types'

const props = withDefaults(
  defineProps<{
    align?: 'left' | 'center' | 'right'
    amount: number
    colorize?: MoneyTypeSlug
    currencyCode: CurrencyCode
    isShowBaseRate?: boolean
    isShowMinus?: boolean
    isShowPlus?: boolean
    isShowSymbol?: boolean
    type?: MoneyTypeNumber
    variant?: '2xs' | '3xl' | 'base' | 'sm' | 'xl'
  }>(),
  {
    align: 'right',
    isShowBaseRate: true,
    isShowSymbol: true,
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
      '-text-expense !text-[#ED6660]': props.colorize === 'expense' && props.type === 0,
      '!text-income-1 !-text-[#22A2D3]': props.colorize === 'income' && props.type === 1,
      'text-2xs': props.variant === '2xs',
      'text-xs': props.variant === 'sm',
      'text-3xl': props.variant === '3xl',
      'text-xl': props.variant === 'xl',
      'text-base': props.variant === 'base',
    }"
    class="
      grid gap-1
      font-secondary text-1 leading-none
    "
    @click="(e: Event) => emit('click', e)"
  >
    <AmountItem
      v-if="amount === 0"
      :align="props.align"
      :isShowSymbol="props.isShowSymbol"
      :symbol="getCurrencySymbol(props.currencyCode)"
      amount="0"
    />

    <template v-if="amount !== 0">
      <AmountItem
        :align="props.align"
        :amount="formatAmount(amount, currencyCode)"
        :isShowMinus="props.isShowMinus"
        :isShowPlus="props.isShowPlus"
        :isShowSymbol="props.isShowSymbol"
        :symbol="getCurrencySymbol(props.currencyCode)"
      />

      <AmountItem
        v-if="isShowBaseRate && currencyCode !== baseCurrencyCode"
        :align="props.align"
        :amount="getAmountInBaseRate({ amount, currencyCode })"
        :isShowMinus="props.isShowMinus"
        :isShowPlus="props.isShowPlus"
        :isShowSymbol="props.isShowSymbol"
        :symbol="getCurrencySymbol(baseCurrencyCode)"
        class="text-xs opacity-70"
      />
    </template>
  </div>
</template>
