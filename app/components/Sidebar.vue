<template lang="pug">
.sidebar(:class="{_hidden: !showSidebar}", @click.prevent="toogleMenu()")
  .sidebar__menu(@click.prevent.stop="toogleMenu(true)")
  .sidebar__wrap
    .sidebar__in
      .account
        .accountTitle Accounts
        .accountContent

          //- Account item
          template(v-for="account in accounts")
            router-link.accountContentItem._circle(
                :to="`/accounts/${account.id}`",
                :class="`account${account.id}`"
              )
              .accountContentItemLabel {{ account.name }} <sup>{{ account.id }}</sup>
              .accountContentItemTotal
                template(v-if="account.total > 0")
                  .accountContentItemTotalIn {{ formatMoney(account.totalRub) }}
                  .accountContentItemTotalIn(v-if="account.currency !== 'RUB'") {{ formatMoney(account.total, account.currency)}}
                template(v-else)
                  .accountContentItemTotalIn 0 {{account.symbol}}

      .account
        .accountTitle Summary
        .accountContent
          .accountContentItem
            .accountContentItemLabel Total
            .accountContentItemTotal
              .accountContentItemTotalIn {{ showSumIn('RUB') }}
              .accountContentItemTotalIn {{ showSumIn('USD') }}
          .accountContentItem
            .accountContentItemLabel Rate
            .accountContentItemTotal
              .accountContentItemTotalIn {{ showRateOf('USD') }}
              .accountContentItemTotalIn {{ showRateOf('EUR') }}
</template>


<script>
import { mapGetters } from 'vuex'
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney],

  data() {
    return {
      showSidebar: true
    }
  },

  computed: {
    ...mapGetters(['accounts', 'rates']),

    total() {
      const accounts = this.accounts.filter(a => a.id === 1 || a.id === 2)
      return accounts.reduce((sum, account) => sum + account.totalRub, 0)
    }
  },

  methods: {
    toogleMenu(fromMenu = false) {
      if(fromMenu === true) {
        this.showSidebar = !this.showSidebar
      }
      else {
        this.showSidebar = true
      }
    },
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
