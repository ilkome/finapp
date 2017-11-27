<template lang="pug">
transition(name="leftBarAnimation")
  .sidebar(v-show="$store.state.leftBar.isShow")

    //- Mobile header
    template(v-if="$store.state.isMobile")
      .sidebar__close(@click="$store.commit('toogleLeftbar', 'hide')")
        .sidebar__close__title: .fa.fa-arrow-left
        .sidebar__close__title Wallets
        .sidebar__close__icon: .fa.fa-plus

    .sidebar__in
      //- Walltes
      .sidebar__row
        template(v-if="!$store.state.isMobile")
          .sidebar__head
            .sidebarTitle(
              @click="toogleShowEditBtns"
              v-tooltip.bottom-center="{ content: isShowEditBtns ? 'Hide edit buttons' : 'Show edit buttons' }"
            )
              .sidebarTitle__text Wallets
              .sidebarTitle__icon._mb(
                :class="{ _active: isShowEditBtns }"
              ): .fa.fa-pencil-square-o

            .sidebar__actions
              template(v-if="isShowEditBtns")
                .sidebar__link(
                  :class="{ _active: $store.state.accounts.create }"
                  @click="$store.commit('toogleAccountCreate')"
                  v-tooltip.bottom-center="{ content: $store.state.accounts.create ? 'Close' : 'Create new wallet' }"
                ): .plus

        //- Have accounts
        .sidebar__wrap(v-if="accounts.length")
          template(v-for="(account, index) in accounts")
            template(v-if="index < visibleAccounts")
              .sidebarItem(
                :key="index"
                @click.prevent="onClickAccount(account)"
                :class="getClassName(account)"
              )
                .sidebarItem__content
                  template(v-if="$store.state.isShowSidebarAccountsIcons")
                    .sidebarItem__icon
                      .icon._round(:style="`background: ${account.color}`")
                        .icon__abbr {{ account.name.charAt(0) }}{{ account.name.charAt(1) }}
                  .sidebarItem__name {{ account.name }}
                  .sidebarItem__money
                    template(v-if="account.total !== 0")
                      template(v-if="account.currency !== 'RUB'")
                        div(v-if="account.currency !== 'RUB'") {{ formatMoney(account.total, account.currency)}}
                        div.sub {{ formatMoney(account.totalRub) }}
                      template(v-else)
                        div {{ formatMoney(account.totalRub) }}
                    template(v-else)
                      div 0 {{account.symbol}}

                  template(v-if="isShowEditBtns")
                    .sidebarItem__actions
                      .sidebarItem__action(@click.stop.prevent="toogleAccountEdit(account)")
                        template(v-if="$store.state.accounts.editAccount && $store.state.accounts.editAccount.id === account.id")
                          .fa.fa-times-circle
                        template(v-else)
                          .fa.fa-pencil-square-o

                      .sidebarItem__action(@click.stop.prevent="askQuestion(account.id)")
                        .fa.fa-trash-o

                .confirmPop(v-if="questionId === account.id")
                  .confirmPop__in
                    template(v-if="avaliableForDelete(account.id).allow")
                      .confirmPop__text._delete Delete account {{ account.name }}?
                      .confirmPop__actionItem(@click.prevent.stop="closeConfirmPop()"): .fa.fa-ban
                      .confirmPop__actionItem._delete(@click.prevent.stop="deleteAccount(account.id)"): .fa.fa-check
                    template(v-else)
                      .confirmPop__text._delete {{ avaliableForDelete(account.id).explain }}
                      .confirmPop__actionItem(@click.prevent.stop="closeConfirmPop()"): .fa.fa-check

          //- toogle
          template(v-if="accounts.length > visibleAccounts")
            .sidebarSummary._toogle._link(@click="setVisibleAccounts('all')")
              .sidebarSummary__label Show all wallets
          template(v-if="visibleAccounts > 4")
            .sidebarSummary._toogle._link(@click="setVisibleAccounts(4)")
              .sidebarSummary__label Show only 4 wallets

          template(v-if="$store.state.isMobile")
            .sidebarSummary._toogle._link(@click="toogleShowEditBtns")
              .sidebarSummary__label {{ isShowEditBtns ? 'Hide edit buttons' : 'Show edit buttons' }}
            .sidebarSummary._toogle._link(@click="$store.commit('toogleAccountCreate')")
              .sidebarSummary__label Create new walliet

        //- No accounts
        template(v-if="!accounts.length")
          div
            .trnForm__actions__btn(@click="$store.commit('toogleAccountCreate')") Create wallet

      //- Filter
      template(v-if="getFilter.category || getFilter.account")
        .sidebar__row
          .sidebar__head
            .sidebarTitle(@click.prevent="clearFilter")
              .sidebarTitle__text
                .sidebarTitle__text__in Selected
              .sidebarTitle__icon: .close


          .sidebar__wrap
            template(v-if="getFilter.account")
              .sidebarItem(
                @click.prevent="$store.commit('setFilterAccount', null)"
              )
                .sidebarItem__content
                  .sidebarItem__icon
                    .icon._round(:style="`background: ${getFilter.account.color}`")
                      .icon__abbr {{ getFilter.account.name.charAt(0) }}{{ getFilter.account.name.charAt(1) }}
                  .sidebarItem__name {{ getFilter.account.name }}

            template(v-if="getFilter.category")
              .sidebarItem(
                @click.prevent="$store.commit('setFilterCategory', null)"
              )
                .sidebarItem__content
                  .sidebarItem__icon
                    .icon(:style="`background: ${getFilter.category.color}`")
                      div(:class="getFilter.category.icon")
                  .sidebarItem__name {{ getFilter.category.name }}

      //- Summary
      .sidebar__row
        .sidebar__wrap
          .sidebarSummary
            .sidebarSummary__label Total in RUB
            .sidebarSummary__value {{ showTotalIn('RUB') }}
          .sidebarSummary
            .sidebarSummary__label Total in USD
            .sidebarSummary__value {{ showTotalIn('USD') }}
          .sidebarSummary
            .sidebarSummary__label Currency rate
            .sidebarSummary__value._two {{ showRateOf('USD') }} <span class="sep">/</span> {{ showRateOf('EUR') }}
</template>

<script>
import { mapGetters } from 'vuex'
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney],

  data() {
    return {
      questionId: null,
      visibleAccounts: 4,
      isShowEditBtns: false
    }
  },

  computed: {
    ...mapGetters(['accounts', 'trns', 'rates', 'getFilter']),
    totalInAllAccounts() {
      const accounts = this.accounts.filter(a => a.countTotal === 1)
      return accounts.reduce((sum, account) => sum + account.totalRub, 0)
    }
  },

  methods: {
    clearFilter() {
      this.$store.commit('setFilterAccount', null)
      this.$store.commit('setFilterCategory', null)
    },
    getClassName(account) {
      return {
        _active: this.getFilter.account && account.id === this.getFilter.account.id,
        _withActions: this.isShowEditBtns,
        _editable: this.isShowEditBtns && this.$store.state.accounts.editAccount && this.$store.state.accounts.editAccount.id === account.id
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
    onClickToogleCategories() {
      this.$store.commit('toogleCategoriesList')
      this.$store.commit('toogleAccountList', 'hide')
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
    },
    avaliableForDelete(accountId) {
      const account = this.accounts.find(account => account.id === accountId)
      const trnsInAccount = this.trns.find(trn => trn.accountId === account.id)

      if (trnsInAccount) {
        return {
          allow: false,
          explain: `You can not delete the account wich is contains trns`
        }
      }
      return {
        allow: true
      }
    },
    async deleteAccount(accountId) {
      this.$store.commit('showLoader')
      await this.$store.dispatch('deleteAccount', accountId)
      this.questionId = null
      this.$store.commit('closeLoader')
      this.$notify({
        group: 'foo',
        title: 'Succesed',
        text: 'Account was deleted.',
        type: 'success'
      })
    },
    askQuestion(accountId) {
      this.questionId = accountId
    },
    closeConfirmPop() {
      this.questionId = null
    },
    toogleAccountEdit(account) {
      if (this.$store.state.accounts.editAccount && this.$store.state.accounts.editAccount.id === account.id) {
        this.$store.commit('toogleAccountEdit', 'hide')
        this.$store.commit('setEditAccount', null)
      } else {
        this.$store.commit('toogleAccountEdit', 'show')
        this.$store.commit('setEditAccount', account)
      }
    },
    toogleShowEditBtns() {
      this.isShowEditBtns = !this.isShowEditBtns
    }
  }
}
</script>
