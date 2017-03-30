<template lang="pug">
.accountPage
  h1.title
    | Кошелек:
    .name(:class="`account${account.id}`")  {{ account.name }}
    .name {{ account.currency }}
    .sup {{ account.id }}

  .table
    .table__cell
      SummaryShort(
        :expenses="account.totalExpenses",
        :incomes="account.totalIncomes"
      )
      TrnsList(:trns="trnsList")

    .table__cell
      TrnCreate(:account="account")
</template>


<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import formatMoney from '../../mixins/formatMoney'
import SummaryShort from '../summary/SummaryShort.vue'
import TrnCreate from '../trn/TrnCreate.vue'
import TrnsList from '../trn/TrnsList.vue'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['accounts', 'trns']),
    account() {
      return this.accounts.find(a => a.id === +this.$route.params.id)
    },
    trnsList() {
      return this.trns.filter(trn => trn.accountId === +this.$route.params.id).slice(0, 10)
    }
  },

  components: { SummaryShort, TrnCreate, TrnsList }
}
</script>
