<template lang="pug">
.accountsPage(@click.prevent.stop="closeConfirmPop()")
  .content
    .module
      .module-in
        h1.title Accounts

        .accounts
          .mb20
            .btn(@click="$store.commit('toogleAccountCreate')") Create account

          template(v-if="accountsList.length")
            .categories__filter
              input(type="text", v-model.trim="filter", placeholder="Filter" v-focus.lazy="focus").categories__filter__input

            template(v-for="account in accountsList")
              .categoryItem
                .categoryItem__content
                  .categoryItem__icon
                    .icon(:class="`bg-${account.id}`")
                      .icon__abbr {{ account.name.charAt(0) }}{{ account.name.charAt(1) }}
                  .categoryItem__name {{ account.name }}
                  .item__el._price.sum
                    div {{ formatMoney(account.totalRub) }}
                    div(v-if="account.currency !== 'RUB'") {{ formatMoney(account.total, account.currency) }}
                  .item__el._second {{ account.currency }}
                  .categoryItem__action(@click.stop.prevent="toogleEditCategory(account)")
                    .fa.fa-pencil
                  .categoryItem__action(@click.stop.prevent="askQuestion(account.id)")
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

</template>

<script>
import { mapGetters } from 'vuex'
import formatMoney from '../mixins/formatMoney'
import { mixin } from 'vue-focus'

export default {
  mixins: [formatMoney, mixin],

  data() {
    return {
      focus: false,
      newAccount: {
        name: '',
        currency: 'RUB',
        countTotal: 1,
        symbol: ''
      },
      filter: '',
      questionId: null
    }
  },

  mounted() {
    setTimeout(function () {
      this.focus = true
    }.bind(this), 100)
  },

  computed: {
    ...mapGetters(['trns', 'accounts']),
    accountsList() {
      return this.accounts.filter(account =>
        account.name.toLowerCase().search(this.filter.toLowerCase()) !== -1)
    }
  },

  methods: {
    avaliableForDelete(accountId) {
      const account = this.accounts.find(account => account.id === accountId)
      const trnsInAccount = this.trns.filter(trn => trn.accountId === account.id)

      if (trnsInAccount.length) {
        return {
          allow: false,
          explain: `You can not delete the account contains trns!`
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
    },

    askQuestion(accountId) {
      this.questionId = accountId
    },

    closeConfirmPop() {
      this.questionId = null
    },

    toogleEditCategory(account) {
      if (this.$store.state.accounts.editAccount && this.$store.state.accounts.editAccount.id === account.id) {
        this.$store.commit('toogleAccountEdit', 'hide')
        this.$store.commit('setEditAccount', null)
      } else {
        this.$store.commit('toogleAccountEdit', 'show')
        this.$store.commit('setEditAccount', account)
      }
    }
  }
}
</script>
