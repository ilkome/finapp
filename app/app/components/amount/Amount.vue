<script setup lang="ts">
import type { MoneyTypeSlug } from '~/components/amount/types'
import type { CurrencyCode } from '~/components/currencies/types'
import type { TrnType } from '~/components/trns/types'

import { formatAmount, getCurrencySymbol } from '~/components/amount/utils'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

type AmountProps = {
  align?: 'left' | 'center' | 'right'
  /** Minor units of `currencyCode`. */
  amount: number
  colorize?: MoneyTypeSlug
  currencyCode: CurrencyCode
  isShowBaseRate?: boolean
  isShowMinus?: boolean
  isShowPlus?: boolean
  isShowSymbol?: boolean
  type?: TrnType
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
  type,
  variant = 'default',
} = defineProps<AmountProps>()

const emit = defineEmits<{
  click: [e: Event]
}>()

const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div
    :class="{
      'text-expense-1!': colorize === 'expense' && type === 'expense',
      'text-income-1!': colorize === 'income' && type === 'income',
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
        :amount="formatAmount(amount, currencyCode)"
        :isShowMinus="isShowMinus"
        :isShowPlus="isShowPlus && amount > 0"
        :isShowSymbol="isShowSymbol"
        :symbol="getCurrencySymbol(currencyCode)"
      />

      <AmountItem
        v-if="isShowBaseRate && currencyCode !== currenciesStore.base"
        :align="align"
        :amount="formatAmount(currenciesStore.toBase(amount, currencyCode), currenciesStore.base)"
        :isShowMinus="isShowMinus"
        :isShowPlus="isShowPlus && amount > 0"
        :isShowSymbol="isShowSymbol"
        :symbol="getCurrencySymbol(currenciesStore.base)"
        class="text-xs opacity-70"
      />
    </template>
  </div>
</template>
