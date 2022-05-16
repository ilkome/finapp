<script setup lang="ts">
import useAmount from '~/components/amount/useAmount'

const props = defineProps<{
  amount: Number
  currency: String
  colorize: String
  type: Number
  align: String
}>()

const { baseCurrency, formatAmount, getCurrencySymbol, getAmountInBaseCurrency } = useAmount()
const sign = props.type === 0 ? '-' : '+'

const classes = computed(() => ({
  'justify-end': !props.align,
  'justify-start': props.align === 'left',
}))
</script>

<template lang="pug">
.font-unica.gap-1.flex.flex-col(
  @click="event => $emit('click', event)"
)
  //- Amount
  template(v-if="amount !== 0")
    div(:class="[{ 'text-green-600 dark_text-green-500': colorize === 'incomes' && type === 1 }]")
      //- Original
      .gap-1.flex.items-baseline.whitespace-nowrap(
        :class="classes"
      )
        .text-md.leading-none {{ sign }}
        .text-md.leading-none {{ formatAmount(amount) }}
        .text-xs.leading-none {{ getCurrencySymbol(currency) }}

      //- Base
      .text-neutral-400.gap-1.flex.items-baseline.whitespace-nowrap(
        v-if="currency !== baseCurrency"
        :class="classes"
      )
        .text-md.leading-none {{ sign }}
        .text-md.leading-none {{ getAmountInBaseCurrency({ amount, currency }) }}
        .text-xs.leading-none {{ getCurrencySymbol(baseCurrency) }}

  //- 0
  template(v-if="amount === 0")
    .text-md.leading-none.flex.items-baseline 0
</template>
