<template lang="pug">
div
  h1 Кошельки
  table.ui.table.striped.celled.sortable
    thead: tr
      th(@click="sortTable('id')") ID
      th(@click="sortTable('name')") Название
      th Валюта
      th.right.aligned(@click="sortTable('totalRub')") Сумма
      th.right.aligned Ориг. сумма
    tbody
      tr(v-for="account in accounts")
        td {{ account.id }}
        td {{ account.name }}
        td {{ account.currency }}
        td.right.aligned {{ showTotal(account.totalRub) }}
        td.right.aligned {{ showTotal(account.total, account.currency) }}
</template>

<script>
import { money, getSymbol } from '../js/money'

export default {
  data() {
    return {
      sortKey: '',
      sortBy: 'asc',
      accounts: this.$root.$data.appData.accounts
    }
  },

  methods: {
    showTotal(sum, currency) {
      if (!currency || currency === 'RUB') return money(sum)
      const symbol = getSymbol(currency)
      return money(sum, { symbol })
    },
    sortTable(queryKey) {
      this.sortKey = queryKey
      if (this.sortKey === queryKey && this.sortBy !== 'desc') {
        this.sortBy = 'desc'
      } else {
        this.sortBy = 'asc'
      }

      this.accounts = _.orderBy(this.accounts, this.sortKey, this.sortBy)
    }
  }
}
</script>
