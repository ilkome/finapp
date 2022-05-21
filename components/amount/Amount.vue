<script setup lang="ts">
import useAmount from '~/components/amount/useAmount'
import { formatAmount, getCurrencySymbol } from '~/components/amount/formatAmount'

const props = withDefaults(defineProps<{
  amount: number
  currencyCode: string
  colorize?: string
  type?: number
  align?: string
  isShowBaseRate?: boolean
  isShowSign?: boolean
}>(), {
  isShowBaseRate: true,
  isShowSign: true,
})

const { baseCurrencyCode, getAmountInBaseRate } = useAmount()
const sign = props.type === 0 ? '-' : '+'

const alignClasses = computed(() => ({
  'justify-end': !props.align,
  'justify-start': props.align === 'left',
  'justify-center': props.align === 'center',
}))

const amountClasses = computed(() => ([{
  'text-income': props.colorize === 'income' && props.type === 1,
}, {
  'text-expense': props.colorize === 'expense' && props.type === 0,
}]))
</script>

<template lang="pug">
.font-unica.gap-1.flex.flex-col(
  @click="event => $emit('click', event)"
)
  //- Amount
  template(v-if="amount !== 0")
    div(:class="amountClasses")
      //- Original
      .gap-1.flex.items-baseline.whitespace-nowrap(
        :class="alignClasses"
      )
        .text-md.leading-none(v-if="isShowSign && sign === '-'") {{ sign }}
        .text-md.leading-none {{ formatAmount(amount, currencyCode) }}
        .text-xs.leading-none {{ getCurrencySymbol(currencyCode) }}

      //- Base
      .text-neutral-400.gap-1.flex.items-baseline.whitespace-nowrap.opacity-80(
        v-if="isShowBaseRate && currencyCode !== baseCurrencyCode"
        :class="alignClasses"
      )
        .text-xs.leading-none(v-if="isShowSign && sign === '-'") {{ sign }}
        .text-xs.leading-none {{ getAmountInBaseRate({ amount, currencyCode }) }}
        .text-2xs.leading-none {{ getCurrencySymbol(baseCurrencyCode) }}

  //- 0
  template(v-if="amount === 0")
    .gap-1.flex.items-baseline.whitespace-nowrap(
      :class="alignClasses"
    )
      .text-md.leading-none.flex.items-baseline 0
      .text-xs.leading-none {{ getCurrencySymbol(currencyCode) }}
</template>
