<template lang="pug">
.sidebar__wrap
  .sidebar__in
    .account
      .accountTitle Accounts
      .accountContent
        template(v-for="(account, index) in accounts")
          template(v-if="index < visibleAccounts")
            router-link.accountContentItem._circle(
                :to="`/accounts/${account.id}`",
                :class="`account${account.id}`"
              )
              .accountContentItemLabel {{ account.name }}
              .accountContentItemTotal
                template(v-if="account.total > 0")
                  .accountContentItemTotalIn {{ formatMoney(account.totalRub) }}
                  .accountContentItemTotalIn(v-if="account.currency !== 'RUB'") {{ formatMoney(account.total, account.currency)}}
                template(v-else)
                  .accountContentItemTotalIn 0 {{account.symbol}}

      template(v-if="accounts.length > visibleAccounts")
        .accountSidebar__showAll(@click="setVisibleAccounts('all')") Show all
      template(v-if="visibleAccounts > 5")
        .accountSidebar__showAll(@click="setVisibleAccounts(4)") Show only 4 accounts

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
      visibleAccounts: 4
    }
  },

  computed: {
    ...mapGetters(['accounts', 'rates']),

    total() {
      const accounts = this.accounts.filter(a => a.countTotal === 1)
      return accounts.reduce((sum, account) => sum + account.totalRub, 0)
    }
  },

  methods: {
    showRateOf(currency) {
      return this.formatMoney(1 / this.rates[currency], currency)
    },

    showSumIn(currency) {
      if (!currency || currency === 'RUB') return this.formatMoney(this.total)
      return this.formatMoney(this.total * this.rates[currency], currency)
    },

    setVisibleAccounts(count) {
      if (count === 'all') {
        this.visibleAccounts = this.accounts.length
      } else {
        this.visibleAccounts = +count
      }
    }
  }
}
</script>
