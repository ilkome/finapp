<template lang="pug">
transition(name="leftBarAnimation")
  .sidebar(v-show="$store.state.leftBar.isShow")
    .sidebar__wrap
      .sidebar__in
        .sidebar__item
          router-link(to="/" exact).sidebar__menu__link Dashboard
          router-link(to="/alt" exact).sidebar__menu__link Dashboard Alt
          router-link(to="/summary").sidebar__menu__link Total
          router-link(to="/incomes").sidebar__menu__link Incomes
          router-link(to="/expenses").sidebar__menu__link Expenses
          router-link(to="/categories").sidebar__menu__link Categories
          router-link(to="/accounts").sidebar__menu__link Accounts
          .sidebar__menu__link(@click.prevent="$store.commit('signOut')") LogOut

        .sidebar__item
          .sidebar__title Accounts
          //- Have accounts
          .sidebar__accounts(v-if="accounts.length")
            template(v-for="(account, index) in accounts")
              template(v-if="index < visibleAccounts")
                router-link.sidebar__account(
                  :to="`/accounts/${account.id}`",
                  :class="`account${account.id}`")
                  .sidebar__account__label {{ account.name }}
                  .sidebar__account__value
                    template(v-if="account.total !== 0")
                      div {{ formatMoney(account.totalRub) }}
                      div(v-if="account.currency !== 'RUB'") {{ formatMoney(account.total, account.currency)}}
                    template(v-else)
                      div 0 {{account.symbol}}
            template(v-if="accounts.length > visibleAccounts")
              .sidebar__accounts__showAll(@click="setVisibleAccounts('all')") Show all
            template(v-if="visibleAccounts > 4")
              .sidebar__accounts__showAll(@click="setVisibleAccounts(4)") Show only 4 accounts

          //- No accounts
          router-link.sidebar__account(
            v-if="!accounts.length",
            to="accounts",
            title="Create new account")
            .sidebar__account__label Create new account

        .sidebar__item
          .sidebar__title Info
          .sidebar__summary
            .sidebar__summary__item
              .sidebar__summary__item__label Total
              .sidebar__summary__item__value
                div {{ showSumIn('RUB') }}
                div {{ showSumIn('USD') }}
            .sidebar__summary__item
              .sidebar__summary__item__label Currency rate
              .sidebar__summary__item__value
                div {{ showRateOf('USD') }}
                div {{ showRateOf('EUR') }}
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
