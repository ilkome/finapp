<template lang="pug">
.table
  .table__cell
    .panel
      pre {{expenses}}
      h2.title Рассходы
      .panel__chart(:class="{_hidden: expensesEmpty}")
        Chart(:data="expenses")
      .panel__empty(:class="{_visible: expensesEmpty}") Рассходов за выбранный период не было

  .table__cell
    .panel
      h2.title Поступления
      .panel__chart(:class="{_hidden: incomesEmpty}")
        Chart(:data="incomes")
      .panel__empty(:class="{_visible: incomesEmpty}") Поступлений за выбранный период не было
</template>


<script>
import isEmpty from 'lodash/isEmpty'
import formatMoney from '../../mixins/formatMoney'
import formatDataForCharts from '../../mixins/formatDataForCharts'
import Chart from '../chart/Chart.vue'

export default {
  mixins: [formatMoney, formatDataForCharts],

  props: {
    expenses: {
      type: Object
    },
    incomes: {
      type: Object
    }
  },

  computed: {
    expensesEmpty() {
      return isEmpty(this.expenses.series[0].data)
    },
    incomesEmpty() {
      return isEmpty(this.incomes.series[0].data)
    }
  },

  methods: {
    isEmpty(obj) {
      return isEmpty(obj)
    }
  },

  components: { Chart }
}
</script>
