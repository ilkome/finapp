<template lang="pug">
.panel
  .summaryShort
    template(v-if="expenses > 0 || incomes > 0")

      .summaryShort__el
        .accountDetails

          .accountItem
            .accountItem__label Рассход
            .accountItem__total.expense
              div {{ formatMoney(expenses) }}
              div(v-if="expenses > 0 && duration > 1") {{ formatMoney(expenses / duration) }}

          .accountItem
            .accountItem__label Приход
            .accountItem__total.income
              div {{ formatMoney(incomes) }}
              div(v-if="incomes > 0 && duration > 1") {{ formatMoney(incomes / duration) }}

          .accountItem
            .accountItem__label Итого
            .accountItem__total.sum
              div {{ formatMoney(incomes - expenses) }}
              div(v-if="duration > 1") {{ formatMoney((incomes - expenses) / duration) }}

      .summaryShort__el._pie
        Chart(chartType="pie", :data="chartData")
</template>


<script>
import Chart from '../chart/Chart.vue'
import formatMoney from '../../mixins/formatMoney'
import formatDataForCharts from '../../mixins/formatDataForCharts'

export default {
  mixins: [formatMoney, formatDataForCharts],
  props: {
    duration: {
      type: Number,
      default: 0
    },
    expenses: {
      type: Number,
      default: 0
    },
    incomes: {
      type: Number,
      default: 0
    }
  },

  computed: {
    chartData() {
      return this.formatDataForPieChart(this.expenses, this.incomes)
    }
  },

  components: { Chart }
}
</script>
