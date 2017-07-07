<template lang="pug">
.content
  .module
    h1.title
      | Кошелек:
      .name(:class="`account${account.id}`")  {{ account.name }}
      .name {{ account.currency }}
      .sup {{ account.id }}

    //- .summaryShort(v-if="account.totalExpenses > 0 || account.totalIncomes > 0")
    //-   .summaryShort__item(v-if="account.totalIncome > 0")
    //-     .summaryShort__item__icon._incomes
    //-     .summaryShort__item__label Incomes
    //-     .summaryShort__item__total.incomes {{ formatMoney(account.totalIncome) }}
    //-
    //-   .summaryShort__item(v-if="account.totalExpense > 0")
    //-     .summaryShort__item__icon._expenses
    //-     .summaryShort__item__label Expenes
    //-     .summaryShort__item__total.expenses {{ formatMoney(account.totalExpense) }}

  .module._bg
    TrnsList(:trns="trnsList")
</template>


<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import formatMoney from '../mixins/formatMoney'
import TrnsList from './TrnsList.vue'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['accounts', 'getTrns']),

    account() {
      return this.accounts.find(a => a.id === +this.$route.params.id)
    },

    trnsList() {
      moment()
      return this.getTrns(moment().subtract(1, 'months'), moment()).filter(trn => trn.accountId === +this.$route.params.id).slice(0, 100)
    }
  },

  components: { TrnsList }
}
</script>
