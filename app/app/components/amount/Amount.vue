<script setup lang="ts">
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/amount/types'
import type { CurrencyCode } from '~/components/currencies/types'

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
  variant?: 'compact' | 'default' | 'display' | 'row' | 'secondary' | 'summary'
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
  variant = 'default',
} = defineProps<AmountProps>()

const emit = defineEmits<{
  click: [e: Event]
}>()

const { baseCurrencyCode, getAmountInBaseRate } = useAmount()
</script>

<template>
  <div
    :class="{
      'text-expense-1!': colorize === 'expense' && type === 0,
      'text-income-1!': colorize === 'income' && type === 1,
      'text-2xs': variant === 'secondary',
      'text-xs': variant === 'compact',
      'text-sm': variant === 'row',
      'text-xl': variant === 'summary',
      'text-2xl': variant === 'display',
      'text-base': variant === 'default',
    }"
    class="grid gap-1 font-secondary leading-none tabular-nums"
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
