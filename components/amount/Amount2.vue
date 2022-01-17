<script lang="ts">
import useAmount from '~/components/amount/useAmount'

export default defineComponent({
  props: {
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    colorize: { type: String, default: 'none' },
    type: { type: Number, default: null }
  },

  setup ({ type }) {
    const { baseCurrency, formatAmount, getCurrencySymbol, getAmountInBaseCurrency } = useAmount()
    const sign = type === 0 ? '-' : '+'

    return {
      baseCurrency,
      sign,

      getCurrencySymbol,
      getAmountInBaseCurrency,
      formatAmount
    }
  }
})
</script>

<template lang="pug">
.font-unica.gap-1.flex.flex-col(
  @click="event => $emit('click', event)"
)
  //- Amount
  template(v-if="amount !== 0")
    div(:class="[{ 'text-green-600 dark:text-green-500': colorize === 'incomes' && type === 1 }]")
      //- Original
      .gap-1.flex.items-baseline.justify-end
        .text-md.leading-none {{ sign }}
        .text-md.leading-none {{ formatAmount(amount) }}
        .text-xs.leading-none {{ getCurrencySymbol(currency) }}

      //- Base
      .text-neutral-400.gap-1.flex.items-baseline.justify-end(v-if="currency !== baseCurrency")
        .text-md.leading-none {{ sign }}
        .text-md.leading-none {{ getAmountInBaseCurrency({ amount, currency }) }}
        .text-xs.leading-none {{ getCurrencySymbol(baseCurrency) }}

  //- 0
  template(v-else)
    .text-md.leading-none.flex.items-baseline 0
</template>
