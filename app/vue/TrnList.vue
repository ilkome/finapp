<template lang="pug">
  div
    h1 Кошельки
    table.ui.table.striped.celled.sortable
      thead: tr
        th(@click="sortTable('id')") ID
        th(@click="sortTable('amount')") Сумма
        th.right.aligned Ориг. сумма
      tbody
        tr(v-for="trn in trns")
          td {{ trn.id }}
          td {{ trn.amount }}
</template>

<script>
import { money, getSymbol } from '../js/money'

export default {
  data() {
    return {
      sortKey: '',
      sortBy: 'asc',
      trns: this.$root.$data.appData.allTrns.slice(0, 10)
    }
  },

  methods: {
    showTotal(sum, currency) {
      if (!currency || currency === 'RUB') return money(sum)
      const symbol = getSymbol(currency)
      return money(sum, { symbol })
    },
    // Общий метод с аккаунтами
    sortTable(queryKey) {
      this.sortKey = queryKey
      if (this.sortKey === queryKey && this.sortBy !== 'desc') {
        this.sortBy = 'desc'
      } else {
        this.sortBy = 'asc'
      }

      this.trns = _.orderBy(this.trns, this.sortKey, this.sortBy)
    }
  }
}
</script>
