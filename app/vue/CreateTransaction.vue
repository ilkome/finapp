<template lang="pug">
div
  h1 Создать транзакцию
  .ui.segment
    form.ui.form.mini
      mixin input(label, model, name)
        .field
          label=label
          input(v-model.trim=model type="text" name=name placeholder="0")

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

        //- select.ui.dropdown(v-model="values.accountId")
        //-   option(v-for="account in accounts", :value="account.id") {{ account.name }}

      .field
        label Категория
        .ui.buttons.mini
          .ui.button(
            v-for="transaction in transactions",
            @click="setCategory(transaction.categoryId)",
            :class="{active: (transaction.categoryId === values.categoryId)}"
          ) {{ transaction.categoryName }}

        //- select.ui.dropdown(v-model="values.categoryId")
          option(v-for="category in categories", :value="category.id") {{ category.name }}

      .ui.button(@click="createTransactions()") Создать
    pre {{ values }}
    pre {{ transactions2 }}
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import APP from '../js/constants'

console.log(moment().valueOf())

export default {
  data() {
    return {
      transactions: this.$root.$data.appData.allTrns.slice(0,6),
      accounts: this.$root.$data.appData.accounts,
      categories: this.$root.$data.appData.categories,
      values: {
        accountId: this.$root.$data.appData.accounts[0].id,
        amount: '',
        categoryId: this.$root.$data.appData.allTrns[0].categoryId,
        type: 1,
        date: moment().valueOf(),
        currency: this.$root.$data.appData.accounts[0].currency,
        description: ''
      }
    }
  },

  computed: {
    transactions2() {
      const trns = this.$root.$data.appData.allTrns.slice(0,100)
      let count = 0
      let cats = []
      while (count < 6) {
        console.log(count)
        cats = [...cats, trns[count]]
        count++
        if (cats.findIndex(x => x.categoryId === trns[count].categoryId)) {
          console.log('break')
          break
        }

      }
      console.log(cats)
      return cats
    }
  },

  methods: {
    setCategory(categoryId) {
      this.values.categoryId = categoryId
    },
    setAccoundId(accountId) {
      this.values.accountId = accountId
    },
    getCurrency() {
      this.values.currency = this.accounts.find(a => a.id === this.values.accountId).currency
    },
    async createTransactions() {
      const request = await axios.post(APP.TRANSACTIONS_URL, this.values)
      console.log(request.data)
      return request.data
    }
  }
}
</script>
