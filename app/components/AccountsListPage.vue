<template lang="pug">
.accountsPage(@click.prevent.stop="close()")
  .content
    .module
      h1.title Accounts

      .table
        .table__cell
          input(type="text", v-model.trim="filter", placeholder="Filter").input-filter

          .items
            template(v-for="account in accountsList")
              .loader(:class="{_visible: loading || loadingId === account.id}"): .fa.fa-spinner

              .item
                .item__content
                  .item__el._name {{ account.name }}
                  .item__el._price
                    div {{ formatMoney(account.totalRub) }}
                    div(v-if="account.currency !== 'RUB'") {{ formatMoney(account.total, account.currency) }}
                  .item__el._second {{ account.currency }}
                  router-link.item__el._action(:to="`/accounts/${account.id}`"): .fa.fa-list
                  //- router-link.item__el._action(:to="`/accounts/${account.id}`"): .fa.fa-pencil-square-o
                  .item__el._action(@click.prevent.stop="question(account.id)"): .fa.fa-trash-o

                .item__question(:class="{_visible: questionId === account.id}")
                  .item__el._question Delete account {{ account.name }}?
                  .item__el._no(@click.prevent="close()"): .fa.fa-ban
                  .item__el._yes(@click.prevent="deleteAccount(account.id)"): .fa.fa-check

                .item__loader(:class="{_visible: loadingId === account.id}"): .fa.fa-spinner
          //- trnsList

        .table__cell
          .panel._smallWidth
            h4.title Create account
            .panel__loader(:class="{_visible: loading}"): .fa.fa-spinner
            .panel__content
              .input
                input(v-model.trim="account.name", placeholder="Write account name" type="text").input__field
                .input__label Name

              .input
                input(v-model.trim="account.currency", placeholder="Write currency" type="text").input__field
                .input__label Currency

              .submit
                .submit__btn(v-if="loading") Creating...
                .submit__btn(v-else @click.prevent="addAccount") Create account
</template>

<script>
import { mapGetters } from 'vuex'
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney],

  data() {
    return {
      account: {
        name: '',
        currency: 'RUB',
        symbol: ''
      },
      filter: '',
      loading: false,
      loadingId: null,
      questionId: null
    }
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
      this.loading = true
      this.$store.commit('setAppStatus', 'Создание...')
      await this.$store.dispatch('addAccount', this.account)
      setTimeout(() => this.$store.dispatch('setAppStatus', 'Успешно!'), 2000)
      this.loading = false
      this.account.name = ''
    },

    async deleteAccount(accountId) {
      console.log('delete account')
      this.loadingId = accountId
      this.$store.dispatch('setAppStatus', 'Удаление...')
      await this.$store.dispatch('deleteAccount', accountId)
      setTimeout(() => this.$store.dispatch('setAppStatus', 'Успешно!'), 2000)
      this.questionId = null
      this.loadingId = null
    },

    question(accountId) {
      this.questionId = accountId
    },

    close() {
      this.questionId = null
    }
  }
}
</script>
