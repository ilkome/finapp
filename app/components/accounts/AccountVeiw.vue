<template lang="pug">
.div
  .accountPage
    h1.panelTitle
      | Кошелек:
      span(:class="`account${account.id}`")  {{ account.name }}
      span  ({{ account.currency }})
      sup  {{ account.id }}

    .accountDetails._small
      .accountContentItem
        .accountContentItemLabel Приход
        .accountContentItemTotal.income {{ formatMoney(account.totalIncomes, account.currency) }}
      .accountContentItem
        .accountContentItemLabel Рассход
        .accountContentItemTotal.expense {{ formatMoney(account.totalExpenses, account.currency) }}
      .accountContentItem
        .accountContentItemLabel Всего
        .accountContentItemTotal
          .accountContentItemTotalIn.sum {{ formatMoney(account.totalRub) }}
          .accountContentItemTotalIn.sum(v-if="account.currency !== 'RUB'") {{ formatMoney(account.total, account.currency) }}

  h2.panelTitle._minus Транзакции
  template(v-for="(trn, index) in trnsList")
    .trnsDay
      h3(v-if="!isSameDay(index)") {{ trn.date | date}}
      TrnItem(:trn="trn", :key="trn.id")
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import formatMoney from '../../mixins/money'
import TrnItem from '../trn/TrnItem.vue'

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

  methods: {
    isSameDay(index) {
      const curDay = moment(this.trns[index].date).startOf('day').format()
      if (this.trns[index - 1]) {
        const prevDay = moment(this.trns[index - 1].date).startOf('day').format()
        if (curDay === prevDay) {
          return true
        }
      }
      return false
    }
  },

  components: { TrnItem }
}
</script>
