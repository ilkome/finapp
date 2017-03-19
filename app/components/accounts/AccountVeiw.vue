<template lang="pug">
.accountPage
  h1.panelTitle
    | Кошелек:
    .name(:class="`account${account.id}`")  {{ account.name }}
    .name {{ account.currency }}
    .sup {{ account.id }}

  .infoTable
    .infoTable__cell
      .accountDetails._small
        .accountContentItem
          .accountContentItemLabel Приход
          .accountContentItemTotal.income {{ formatMoney(account.totalIncomes, account.currency) }}
        .accountContentItem
          .accountContentItemLabel Рассход
          .accountContentItemTotal.expense {{ formatMoney(account.totalExpenses, account.currency) }}
        .accountContentItem
          .accountContentItemLabel Итого
          .accountContentItemTotal
            .accountContentItemTotalIn.sum {{ formatMoney(account.totalRub) }}
            .accountContentItemTotalIn.sum(v-if="account.currency !== 'RUB'") {{ formatMoney(account.total, account.currency) }}

  .accountTrns
    h2.panelTitle._minus Транзакции
    template(v-for="(trn, index) in trnsList")
      .trnsDay
        h3(v-if="!isSameDay(index)") {{ trn.date | date}}
        TrnItem(:trn="trn", :key="trn.id")
</template>

<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import formatMoney from '../../mixins/formatMoney'
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
      const curDay = moment(this.trnsList[index].date).startOf('day').format()
      if (this.trnsList[index - 1]) {
        const prevDay = moment(this.trnsList[index - 1].date).startOf('day').format()
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
