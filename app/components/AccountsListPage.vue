<template lang="pug">
.accountsPage(@click.prevent.stop="close()")
  h1.title._mid Кошельки

  .table
    .table__cell
      input(type="text", v-model.trim="filter", placeholder="Фильтр").input-filter

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
              router-link.item__el._action(:to="`/accounts/${account.id}`"): .fa.fa-pencil-square-o
              .item__el._action(@click.prevent.stop="question(account.id)"): .fa.fa-trash-o

            .item__question(:class="{_visible: questionId === account.id}")
              .item__el._question Удалить кошелек {{ account.name }}?
              .item__el._no(@click.prevent="close()"): .fa.fa-ban
              .item__el._yes(@clic.preventk="deleteAccount(account.id)"): .fa.fa-check

            .item__loader(:class="{_visible: loadingId === account.id}"): .fa.fa-spinner
      //- trnsList

    .table__cell
      .panel._smallWidth
        h4.title Создание кошелька
        .panel__loader(:class="{_visible: loading}"): .fa.fa-spinner
        .panel__content
          .input
            input(v-model.trim="account.name", v-on:blur="(e) => log(e)", placeholder="Введите название кошелька" type="text").input__field
            .input__label Название

          .input
            input(v-model.trim="account.currency", placeholder="Укажите валюту" type="text").input__field
            .input__label Валюта

          .submit
            .submit__btn(v-if="loading") Создание...
            .submit__btn(v-else @click.prevent="addAccount") Создать кошелек
      //- panel
</template>

<script>
import { mapGetters } from 'vuex'
import formatMoney from '../mixins/formatMoney'

export default {
  mixins: [formatMoney],

  data() {
    return {
      account: {
        name: Math.random(),
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
      this.account.name = Math.random()
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
    },
    log(e) {
    }
  }
}
</script>
