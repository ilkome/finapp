<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'

import { useAmount } from '~/components/amount/useAmount'
import { formatAmount, getCurrencySymbol } from '~/components/amount/utils'

export type AmountProps = {
  align?: 'left' | 'center' | 'right'
  amount: number
  colorize?: MoneyTypeSlug
  currencyCode: CurrencyCode
  isShowBaseRate?: boolean
  isShowMinus?: boolean
  isShowPlus?: boolean
  isShowSymbol?: boolean
  precision?: number
  type?: MoneyTypeNumber
  variant?: '2xs' | '3xl' | 'base' | 'xs' | 'sm' | 'xl'
}

const {
  align = 'right',
  amount,
  colorize,
  currencyCode,
  isShowBaseRate = true,
  isShowMinus,
  isShowPlus,
  isShowSymbol = true,
  precision,
  type,
  variant = 'base',
} = defineProps<AmountProps>()

const emit = defineEmits<{
  click: [e: Event]
}>()

const { baseCurrencyCode, getAmountInBaseRate } = useAmount()
</script>

<template>
  <div
    :class="{
      '!text-expense-1': colorize === 'expense' && type === 0,
      '!text-income-1': colorize === 'income' && type === 1,
      'text-2xs': variant === '2xs',
      'text-xs': variant === 'xs',
      'text-sm': variant === 'sm',
      'text-3xl': variant === '3xl',
      'text-xl': variant === 'xl',
      'text-base': variant === 'base',
    }"
    class="font-secondary grid gap-1 leading-none"
    @click="(e: Event) => emit('click', e)"
  >
    <AmountItem
      v-if="amount === 0"
      :align="align"
      :isShowSymbol="isShowSymbol"
      :symbol="getCurrencySymbol(currencyCode)"
      amount="0"
    />

    <template v-if="amount !== 0">
      <AmountItem
        :align="align"
        :amount="formatAmount(amount, currencyCode, { precision })"
        :isShowMinus="isShowMinus"
        :isShowPlus="isShowPlus"
        :isShowSymbol="isShowSymbol"
        :symbol="getCurrencySymbol(currencyCode)"
      />

      <AmountItem
        v-if="isShowBaseRate && currencyCode !== baseCurrencyCode"
        :align="align"
        :amount="getAmountInBaseRate({ amount, currencyCode })"
        :isShowMinus="isShowMinus"
        :isShowPlus="isShowPlus"
        :isShowSymbol="isShowSymbol"
        :symbol="getCurrencySymbol(baseCurrencyCode)"
        class="text-xs opacity-70"
      />
    </template>
  </div>
</template>
