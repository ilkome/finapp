<template lang="pug">
.summaryShort._limitWidth
  .summaryShort__content

    template(v-if="expenses > 0 || incomes > 0")
      .summaryShort__el
        .accountDetails

          .accountItem
            .accountItem__label Expense
            .accountItem__total.expense {{ formatMoney(expenses) }}

          .accountItem
            .accountItem__label Income
            .accountItem__total.income {{ formatMoney(incomes) }}

          .accountItem
            .accountItem__label Total
            .accountItem__total.sum {{ formatMoney(incomes - expenses) }}

    template(v-else)
      .summaryShort__empty No transactions.
</template>


<script>
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney],

  props: {
    expenses: {
      type: Number,
      default: 0
    },
    incomes: {
      type: Number,
      default: 0
    }
  }
}
</script>
