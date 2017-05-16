<template lang="pug">
.content
  .module
    h1.title
      | Кошелек:
      .name(:class="`account${account.id}`")  {{ account.name }}
      .name {{ account.currency }}
      .sup {{ account.id }}

    SummaryShort(
      :expenses="account.totalExpenses",
      :incomes="account.totalIncomes"
    )

  .module._bg
    h1.title._wide._trns Trns list
    TrnsList(:trns="trnsList")
</template>


<script>
import { mapGetters } from 'vuex'
import formatMoney from '../mixins/formatMoney'
import SummaryShort from './SummaryShort.vue'
import TrnsList from './TrnsList.vue'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['accounts', 'trns']),

    account() {
      return this.accounts.find(a => a.id === +this.$route.params.id)
    },

    trnsList() {
      return this.trns.filter(trn => trn.accountId === +this.$route.params.id).slice(0, 100)
    }
  },

  components: { SummaryShort, TrnsList }
}
</script>
