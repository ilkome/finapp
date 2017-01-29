<template lang="pug">
div
  component(v-if="!$route")
    div fooo
  h1 Транзакция {{ trn.id }}
  table.ui.table.celled
    thead: tr
      th ID
      th Дата
      th Название
      th Категория
      th Кошелек
    tbody
        td {{ trn.id }}
        td {{ trn.date | date }}
        td {{ showTotal(trn.amount) }}
        td {{ trn.categoryName }}
        td {{ trn.accountName }}
</template>

<script>
import { money, getSymbol } from '../js/money'
import moment from 'moment'

export default {
  data() {
    return {
      sortKey: '',
      sortBy: 'asc',
      trn: this.$root.$data.appData.allTrns.find(t => t.id === +this.$route.params.id)
    }
  },

  methods: {
    showTotal(sum, currency) {
      if (!currency || currency === 'RUB') return money(sum)
      const symbol = getSymbol(currency)
      return money(sum, { symbol })
    }
  },
  filters: {
    date(date) {
      return moment(date).format('D.MM.YY')
    }
  }
}
</script>
