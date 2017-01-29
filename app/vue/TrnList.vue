<template lang="pug">
div
  h1 Операции
  table.ui.table.striped.celled.sortable
    thead: tr
      th(@click="sortTable('id')") ID
      th(@click="sortTable('date')") Дата
      th(@click="sortTable('amount')").right.aligned Сумма
      th(@click="sortTable('categoryId')") Категория
      th(@click="sortTable('accountId')") Кошелек
      th Действия
    tbody
      tr(v-for="trn in trns")
        td {{ trn.id }}
        td {{ trn.date | date }}
        td.right.aligned {{ showTotal(trn.amount) }}
        td {{ trn.categoryName }}
        td {{ trn.accountName }}
        td
          div
            router-link(:to="`trn/${trn.id}`") Просмотр
          a(@click="deleteTransaction(trn.id)") Удалить
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import APP from '../js/constants'
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
    },
    async deleteTransaction(id) {
      let alert = ''
      console.log(`${APP.TRANSACTIONS_URL}/${id}`)
      const request = await axios.delete(`${APP.TRANSACTIONS_URL}/${id}`)
      console.log(request.data)
      if (request.data === 1) {
        alert = 'Delete'
      } else {
        alert = 'Error, not delete'
      }
      this.$router.push({ path: `/trns`, query: { alert } })
    }
  },

  filters: {
    date(date) {
      return moment(date).format('D.MM.YY')
    }
  }
}
</script>
