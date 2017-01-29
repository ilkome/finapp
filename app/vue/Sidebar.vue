<template lang="pug">
.sidebar
  router-link(to="/").logo FinApp

  .accounts
    .accounts__title Кошельки

    //- Account item
    .account-item(v-for="account in accounts")
      .name {{ account.name }}
      .value
        div {{ showAccountTotal(account.totalRub) }}
        template(v-if="account.currency !== 'RUB'")
          div {{ showAccountTotal(account.total, account.currency)}}

    //- Total amount
    .account-item
      .name: strong Всего
      .value
        div {{ showSumIn('RUB') }}
        div {{ showSumIn('USD') }}
        div {{ showSumIn('EUR') }}

  //- Rates
  .accounts
    .accounts__title Курсы
    .account-item
      .name Доллар
      .value {{ showRateOf('USD') }}
    .account-item
      .name Евро
      .value {{ showRateOf('EUR') }}
</template>

<script>
import { money, getSymbol } from '../js/money'

export default {
  props: {
    accounts: { type: Array, required: true },
    rates: { type: Object, required: true }
  },

  methods: {
    showAccountTotal(value, currency) {
      if (!currency || currency === 'RUB') return money(value)
      const symbol = getSymbol(currency)
      return money(value, { symbol })
    },
    showRateOf(currency) {
      const symbol = getSymbol(currency)
      return money(1 / this.rates[currency], { symbol, precision: 2 })
    },
    showSumIn(currency) {
      if (!currency || currency === 'RUB') return money(this.sum)
      const symbol = getSymbol(currency)
      return money(this.sum * this.rates[currency], { symbol })
    },
    showTotal(sum, currency) {
      if (!currency || currency === 'RUB') return money(sum)
      const symbol = getSymbol(currency)
      return money(sum, { symbol })
    },
  },

  computed: {
    sum() {
      return this.accounts.reduce((sum, current) => sum + current.totalRub, 0)
    }
  }
}
</script>
