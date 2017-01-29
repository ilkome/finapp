<template lang="pug">
div
  h1 Создать транзакцию
  .ui.segment
    form.ui.form.mini
      mixin input(label, model, name)
        .field
          label=label
          input(@keyup.enter="createTransaction()" v-model.trim=model type="text" name=name placeholder="0")

      +input("Сумма", "values.amount", "amount")
      +input("Описание", "values.description", "description")

      .field
        label Кошелек
        .ui.buttons.mini
          .ui.button(
            v-for="account in accounts",
            @click="setAccoundId(account.id)",
            :class="{active: (account.id === values.accountId)}"
          ) {{ account.name }}

      .field
        label Категория
        .ui.buttons.mini
          .ui.button(
            v-for="transaction in transactions",
            @click="setCategory(transaction.categoryId)",
            :class="{active: (transaction.categoryId === values.categoryId)}"
          ) {{ transaction.categoryName }}

        select.ui.fluid.dropdown(v-model="values.categoryId")
          option(v-for="category in categories", :value="category.id") {{ category.name }}

      .ui.button(@click="createTransaction()") Создать
    pre {{ values }}
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import APP from '../js/constants'


export default {
  data() {
    const appData = this.$root.$data.appData
    return {
      transactions: appData.allTrns.slice(0,6),
      accounts: appData.accounts,
      categories: appData.categories,
      values: {
        accountId: appData.allTrns[0].accountId,
        amount: '',
        categoryId: appData.allTrns[0].categoryId,
        type: 1,
        date: moment().valueOf(),
        currency: appData.allTrns[0].currency,
        description: ''
      }
    }
  },
  methods: {
    setCategory(categoryId) {
      this.values.categoryId = categoryId
    },
    setAccoundId(accountId) {
      this.values.accountId = accountId
      this.values.currency = this.accounts.find(a => a.id === accountId).currency
    },
    async createTransaction() {
      const request = await axios.post(APP.TRANSACTIONS_URL, this.values)
      const newTrnId = request.data
      // this.$router.push({ path: `/trn/${newTrnId}`, query: { alert: 'added' } })
      this.$router.push({ path: `/trns`, query: { alert: 'added' } })
    }
  }
}
</script>
