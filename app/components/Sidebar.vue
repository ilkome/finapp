<template lang="pug">
.sidebar
  .sidebar__wrap
    .sidebar__in
      .account
        .accountTitle Accounts
        .accountContent
          template(v-for="(account, index) in accountsList")
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
          .accountSidebar__showAll(@click="setVisibleAccounts(5)") Show only 5 accounts

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
import orderBy from 'lodash/orderBy'
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney],

  data() {
    return {
      visibleAccounts: 5
    }
  },

  computed: {
    ...mapGetters(['accounts', 'rates']),

    accountsList() {
      return orderBy(this.accounts, a => a.order, 'asc')
    },

    total() {
      const accounts = this.accounts
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
