<template lang="pug">
.accountsPage(@click.prevent.stop="close()")
  .content
    .module
      .module-in
        h1.title Accounts

        .gridTable
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
                    .categoryItem__action(@click.prevent="askQuestion(account.id)")
                      .fa.fa-trash-o

                  .item__question(:class="{_visible: questionId === account.id}")
                    .item__el._question Delete account {{ account.name }}?
                    .item__el._no(@click.prevent="close()"): .fa.fa-ban
                    .item__el._yes(@click.prevent="deleteAccount(account.id)"): .fa.fa-check
            //- trnsList

          .gridTable__item
            .panel._smallWidth
              h4.title._mbs Create account
              .panel__content
                .input
                  input(v-model.trim="account.name", placeholder="Write account name" type="text").input__field
                  .input__label Name

                .input
                  input(v-model.trim="account.currency", placeholder="Write currency" type="text").input__field
                  .input__label Currency

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
      account: {
        name: '',
        currency: 'RUB',
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
    ...mapGetters(['accounts']),
    accountsList() {
      return this.accounts.filter(account =>
        account.name.toLowerCase().search(this.filter.toLowerCase()) !== -1)
    }
  },

  methods: {
    async addAccount() {
      await this.$store.dispatch('addAccount', this.account)
      this.account.name = ''
    },

    async deleteAccount(accountId) {
      console.log('delete account')
      await this.$store.dispatch('deleteAccount', accountId)
      this.questionId = null
    },

    askQuestion(accountId) {
      this.questionId = accountId
    },

    close() {
      this.questionId = null
    }
  }
}
</script>
