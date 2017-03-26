<template lang="pug">
.accountsPage(@click.prevent.stop="close()")
  h1.title._mid Кошельки

  .table
    .table__cell
      input(type="text", v-model.trim="filter", placeholder="Фильтр").input-filter

      //- .input.panel
      //-   input(v-model.trim="filter", placeholder="Введите название кошелька" type="text").input__field
      //-   .input__label Фильтр

      .trnList
        template(v-for="account in accountsList")
          .loader(:class="{_visible: loading || loadingId === account.id}"): .fa.fa-spinner

          .item._alt
            router-link.item__content(
              :to="`/accounts/${account.id}`",
              :key="account.id"
            )
              .item__el._name {{ account.name }}
              .item__el._grow._second {{ account.currency }}
              .item__el._grow._second {{ account.symbol }}
              .item__el._edit._link: .fa.fa-pencil-square-o
              .item__el._link(@click.prevent.stop="question(account.id)"): .fa.fa-trash-o

            .item__question(:class="{_visible: questionId === account.id}")
              .item__el._question._grow Удалить кошелек {{ account.name }}?
              .item__el._no(@click="close()"): .fa.fa-ban
              .item__el._yes(@click="deleteAccount(account.id)"): .fa.fa-check

            .item__loader(:class="{_visible: loadingId === account.id}"): .fa.fa-spinner
      //- trnList

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
import ChartByCategory from '../chart/ChartByCategory.vue'

export default {
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
  },

  components: { ChartByCategory }
}
</script>
