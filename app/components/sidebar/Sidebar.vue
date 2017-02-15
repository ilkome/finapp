<template lang="pug">
.sidebar
  router-link(to="/").logo FinApp

  .accountBl
    .accountBl__title Кошельки
    .accountBl__content
      //- Account item
      .accountItem(v-for="account in accounts")
        .accountItem__label.accountLabel {{ account.name }}
        .accountTotalValue(v-if="account.totalRub")
          .accountTotalValue__in {{ formatMoney(account.totalRub) }}
          .accountTotalValue__in(v-if="account.currency !== 'RUB'") {{ formatMoney(account.total, account.currency)}}
        .accountTotalValue(v-else) 0

    //- Total amount
    .accountTotal
      .accountLabel Всего
      .accountTotalValue
        .accountTotalValue__in {{ showSumIn('RUB') }}
        .accountTotalValue__in {{ showSumIn('USD') }}
        .accountTotalValue__in {{ showSumIn('EUR') }}

    //- Rates
    .accountTotal
      .accountLabel Курс
      .accountTotalValue
        .accountTotalValue__in {{ showRateOf('USD') }}
        .accountTotalValue__in {{ showRateOf('EUR') }}
</template>


<script>
import { mapGetters } from 'vuex'
import formatMoney from '../../mixins/money'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['accounts', 'rates']),

    total() {
      return this.accounts.reduce((sum, account) => sum + account.totalRub, 0)
    }
  },

  methods: {
    showRateOf(currency) {
      return this.formatMoney(1 / this.rates[currency], currency)
    },
    showSumIn(currency) {
      if (!currency || currency === 'RUB') return this.formatMoney(this.total)
      return this.formatMoney(this.total * this.rates[currency], currency)
    }
  }
}
</script>
