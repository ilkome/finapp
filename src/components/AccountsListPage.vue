<template lang="pug">
.accountsPage(@click.prevent.stop="closeConfirmPop()")
  .content
    .module
      .module-in
        h1.title Accounts

        .gridTable
          template(v-if="accountsList.length")
            .gridTable__item
              input(type="text", v-model.trim="filter", placeholder="Filter" v-focus.lazy="focus").filterBtn

              .items
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
                      router-link.categoryItem__action(:to="`/accounts/${account.id}`")
                        .fa.fa-list
                      .categoryItem__action(@click.stop.prevent="askQuestion(account.id)")
                        .fa.fa-trash-o

                    .confirmPop(v-if="questionId === account.id")
                      .confirmPop__in
                        template(v-if="avaliableForDelete(account.id).allow")
                          .confirmPop__text._delete Delete account {{ account.name }}?
                          .confirmPop__actionItem(@click.prevent.stop="closeConfirmPop()"): .fa.fa-ban
                          .confirmPop__actionItem._delete(@click.prevent.stop="deleteAccount(account.key)"): .fa.fa-check
                        template(v-else)
                          .confirmPop__text._delete {{ avaliableForDelete(account.id).explain }}
                          .confirmPop__actionItem(@click.prevent.stop="closeConfirmPop()"): .fa.fa-check

          .gridTable__item
            .panel._smallWidth
              h4.title._mbs Create account
              .panel__content
                .input
                  .input__label Name
                  input.input__field(
                    v-model.trim="newAccount.name", placeholder="Write account name", type="text", name="name")

                .input
                  .input__label Currency
                  input.input__field(
                    v-model.trim="newAccount.currency", placeholder="Write currency", type="text", name="currency")

                .submit
                  .submit__btn(@click.prevent="addAccount") Create account
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
          explain: `You can not delete the account containing trns!`
        }
      }
      return {
        allow: true
      }
    },

    async addAccount() {
      await this.$store.dispatch('addAccount', this.newAccount)
      this.newAccount.name = ''
    },

    async deleteAccount(accountId) {
      await this.$store.dispatch('deleteAccount', accountId)
      this.questionId = null
    },

    askQuestion(accountId) {
      this.questionId = accountId
    },

    closeConfirmPop() {
      this.questionId = null
    }
  }
}
</script>
