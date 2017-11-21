<template lang="pug">
.leftBar
  template(v-if="accountsList.length")
    .filter
      input(
        type="text",
        v-model.trim="filter",
        v-focus.lazy="true && !$store.state.isMobile",
        placeholder="Search"
      ).filter__input
      .filter__btns
        template(v-if="filter !== ''")
          .filter__btn._edit(@click.prevent="filter = ''")
            .fa.fa-eraser
        .filter__btn._edit(@click="$store.commit('toogleAccountCreate')")
          .fa.fa-plus

    .leftBar__main
      template(v-for="account in accountsList")
        .itemList
          .itemList__content
            .itemList__icon
              .icon._small
                .icon__abbr {{ account.name.charAt(0) }}{{ account.name.charAt(1) }}
            .itemList__name {{ account.name }}
            .itemList__money
              template(v-if="account.total !== 0")
                template(v-if="account.currency !== 'RUB'")
                  div(v-if="account.currency !== 'RUB'") {{ formatMoney(account.total, account.currency)}}
                  div.sub {{ formatMoney(account.totalRub) }}
                template(v-else)
                  div {{ formatMoney(account.totalRub) }}
              template(v-else)
                div 0 {{account.symbol}}
            .itemList__actions
              .itemList__action(@click.stop.prevent="toogleEditAccount(account)")
                .fa.fa-pencil-square-o
              .itemList__action(@click.stop.prevent="askQuestion(account.id)")
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

  //- .leftBar__in
    .leftBar__main
      template(v-if="$store.state.accounts.show")
        .trnFormToogle(
          @click.prevent.stop="$store.commit('toogleAccountList', 'hide')",
          :class="{_active: $store.state.accounts.show}"
        ): .trnFormToogle__icon: .trnFormToogle__icon__in +

      .leftBar__main__in
        .sidebar__close(@click="$store.commit('toogleAccountList', 'hide')")
          .sidebar__close__title Accounts
          .sidebar__close__icon: .fa.fa-plus
</template>

<script>
import { mixin } from 'vue-focus'
import { mapGetters } from 'vuex'
import formatMoney from '../../mixins/formatMoney'

export default {
  mixins: [mixin, formatMoney],

  data() {
    return {
      filter: '',
      questionId: null
    }
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

    toogleEditAccount(account) {
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
