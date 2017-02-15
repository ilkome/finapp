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
      th Описание
      th
    tbody
        td {{ trn.id }}
        td {{ trn.date | date }}
        td {{ formatMoney(trn.amount) }}
        td {{ trn.categoryName }}
        td {{ trn.accountName }}
        td {{ trn.description }}
        td
          router-link(:to="`/trn/${trn.id}/edit`") Редактировать
  pre {{trn}}
</template>

<script>
import formatMoney from '../../mixins/money'

export default {
  mixins: [formatMoney],

  computed: {
    trn() {
      return this.$store.getters.trns.find(t => t.id === +this.$route.params.id)
    }
  }
}
</script>
