<template lang="pug">
.component
  .module
    .module-in
      h1 Transfer data
      .transfer
        .btn(@click.prevent="transferData") transferData

</template>

<script>
import firebase from 'firebase'
import { getCategories, getAccounts } from '../api/api'
import { getAllTransactions } from '../api/transactions'

export default {
  computed: {
    user() {
      return this.$store.state.user.user
    }
  },

  methods: {
    async transferData() {
      this.$store.commit('showLoader')

      const db = await firebase.database()
      const trns = await getAllTransactions()
      const categories = await getCategories()
      const accounts = await getAccounts()

      console.log('accounts', accounts.length)
      console.log('categories', categories.length)
      console.log('trns', trns.length)

      await db.ref(`users/${this.user.uid}`).remove()

      for (const trn of trns) {
        await db.ref(`users/${this.user.uid}/trns`).push({
          id: trn.id,
          accountId: trn.accountId,
          amount: trn.amount,
          categoryId: trn.categoryId,
          currency: trn.currency,
          date: trn.date,
          description: trn.description,
          type: trn.type
        })
      }

      for (const category of categories) {
        await db.ref(`users/${this.user.uid}/categories`).push({
          id: category.id,
          color: category.color,
          description: category.description,
          icon: category.icon,
          name: category.name,
          parentId: category.parentId
        })
      }

      for (const account of accounts) {
        await db.ref(`users/${this.user.uid}/accounts`).push({
          id: account.id,
          countTotal: account.countTotal,
          color: account.color,
          currency: account.currency,
          icon: account.icon,
          name: account.name,
          order: account.order,
          symbol: account.symbol
        })
      }

      this.$store.commit('closeLoader')
    }
  }
}
</script>
