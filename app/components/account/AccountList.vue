<template lang="pug">
.accounts-list
  h1.module__title Кошельки
  table.ui.table.striped.celled.sortable
    thead: tr
      th ID
      th Название
      th.right.aligned Сумма
      th.right.aligned Ориг. сумма
      th.right.aligned Приход
      th.right.aligned Рассход
      th Валюта
    tbody
      tr(v-for="account in accounts")
        td {{ account.id }}
        td {{ account.name }}
        td.right.aligned {{ formatMoney(account.totalRub) }}
        td.right.aligned {{ formatMoney(account.total, account.currency) }}
        td.right.aligned {{ formatMoney(account.totalIncomes, account.currency) }}
        td.right.aligned {{ formatMoney(account.totalExpenses, account.currency) }}
        td {{ account.currency }}
</template>

<script>
import { mapGetters } from 'vuex'
import formatMoney from '../../mixins/money'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['accounts'])
  }
}
</script>
