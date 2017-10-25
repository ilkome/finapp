<template lang="pug">
transition(name="leftBarAnimation")
  .sidebar(v-show="$store.state.leftBar.isShow")
    .sidebar__wrap
      .sidebar__in
        template(v-if="$store.state.isMobile")
          .sidebar__close(@click="$store.commit('toogleLeftbar', 'hide')")
            .sidebar__close__title: .fa.fa-arrow-left
            .sidebar__close__icon: .fa.fa-plus

        template(v-if="!$store.state.isMobile")
          .sidebar__item._nav
            .sidebar__row
              .sidebar__menu__link(@click="$store.commit('toogleLeftbar')")
                .logo
                  svg(xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100")
                    path(d="M92.48,7.69C117.38,32.6,61.89,32.06,61.89,50s55.49,17.38,30.58,42.28S68.11,61.68,50.19,61.68,32.81,117.17,7.91,92.26,38.49,67.9,38.49,50-17,32.6,7.91,7.69,32.27,38.28,50.19,38.28,67.57-17.22,92.48,7.69Z")
              .sidebar__menu__link._categories(@click.prevent="$store.commit('toogleCategoriesList')")
                .fa.fa-list-ul
              .sidebar__menu__link._accounts(@click.prevent="$store.commit('toogleAccountList')")
                .fa.fa-credit-card

          //- .sidebar__menu__link(@click.prevent="$store.commit('signOut')") LogOut

        .sidebar__item
          .sidebar__title Accounts
          //- Have accounts
          .sidebar__accounts(v-if="accounts.length")
            template(v-for="(account, index) in accounts")
              template(v-if="index < visibleAccounts")
                .sidebar__account._link(
                  @click.prevent="onClickAccount(account)"
                  :class="getClassName(account)")
                  .sidebar__account__label {{ account.name }}
                  .sidebar__account__value.sum
                    template(v-if="account.total !== 0")
                      div {{ formatMoney(account.totalRub) }}
                      div(v-if="account.currency !== 'RUB'") {{ formatMoney(account.total, account.currency)}}
                    template(v-else)
                      div 0 {{account.symbol}}
            template(v-if="accounts.length > visibleAccounts")
              .sidebar__account._dim._link(@click="setVisibleAccounts('all')")
                .sidebar__account__label Show all
            template(v-if="visibleAccounts > 4")
              .sidebar__account._dim._link(@click="setVisibleAccounts(4)")
                .sidebar__account__label Show only 4 accounts

          //- No accounts
          template(v-if="!accounts.length")
            div
              .trnForm__actions__btn(@click="$store.commit('toogleAccountCreate')") Create account

        .sidebar__item
          .sidebar__accounts
            .sidebar__account
              .sidebar__account__label Total
              .sidebar__account__value.sum
                div {{ showTotalIn('RUB') }}
                div {{ showTotalIn('USD') }}

            .sidebar__account
              .sidebar__account__label Currency rate
              .sidebar__account__value.sum
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
    ...mapGetters(['accounts', 'rates', 'getFilter']),
    totalInAllAccounts() {
      const accounts = this.accounts.filter(a => a.countTotal === 1)
      return accounts.reduce((sum, account) => sum + account.totalRub, 0)
    }
  },

  methods: {
    getClassName(account) {
      return {
        _active: this.getFilter.account && account.id === this.getFilter.account.id
      }
    },
    onClickAccount(account) {
      if (this.getFilter.account && this.getFilter.account.id === account.id) {
        this.$store.commit('setFilterAccount', null)
      } else {
        this.$store.commit('setFilterAccount', account)
        if (this.$store.state.isMobile) {
          this.$store.commit('toogleLeftbar', 'hide')
        }
      }
    },
    showRateOf(currency) {
      return this.formatMoney(1 / this.rates[currency], currency)
    },
    showTotalIn(currency) {
      if (!currency || currency === 'RUB') {
        return this.formatMoney(this.totalInAllAccounts)
      }
      return this.formatMoney(this.totalInAllAccounts * this.rates[currency], currency)
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
