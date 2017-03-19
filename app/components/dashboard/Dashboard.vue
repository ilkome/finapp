<template lang="pug">
div
  h1.panelTitle
    | Итоги за&nbsp;
    a.link(@click.prevent="changeDuration()") {{ duration }} дней

  template(v-if="trnsList.length")
    .infoTable
      .infoTable__cell
        .accountDetails._small
          .accountContentItem
            .accountContentItemLabel Рассход
            .accountContentItemTotal.expense
              div {{ formatMoney(expensesTotal) }}
              template(v-if="expensesTotal > 0 && duration > 1")
                div {{ formatMoney(expensesTotal / duration) }}
          .accountContentItem
            .accountContentItemLabel Приход
            .accountContentItemTotal.income
              div {{ formatMoney(incomesTotal) }}
              template(v-if="incomesTotal > 0 && duration > 1")
                div {{ formatMoney(incomesTotal / duration) }}
          .accountContentItem
            .accountContentItemLabel Итого
            .accountContentItemTotal
              .accountContentItemTotalIn.sum
                div {{ formatMoney(incomesTotal - expensesTotal) }}
                template(v-if="duration > 1")
                  div {{ formatMoney((incomesTotal - expensesTotal) / duration) }}

      .infoTable__pie
        Chart(chartType="pie", :data="pieDataChart")

    .panelCol
      template(v-if="expensesDataChart")
        .panel
          h2.panelTitle Рассходы
          .panelChart
            Chart(:data="expensesDataChart")

      template(v-if="incomesDataChart")
        .panel
          h2.panelTitle Поступления
          .panelChart
            Chart(:data="incomesDataChart")

    .accountTrns
      h2.panelTitle._minus Транзакции
      template(v-for="(trn, index) in trnsList.slice(0, 10)")
        .trnsDay
          h3(v-if="!isSameDay(index)") {{ trn.date | date}}
          TrnItem(:trn="trn", :key="trn.id")

</template>


<script>
import { mapGetters } from 'vuex'
import moment from 'moment'
import formatMoney from '../../mixins/formatMoney'
import TrnItem from '../trn/TrnItem.vue'
import Chart from '../chart/Chart.vue'
import formatDataForCharts from '../../mixins/formatDataForCharts'

export default {
  mixins: [formatMoney, formatDataForCharts],

  data() {
    const duration = 10

    return {
      date: {
        start: moment().subtract(duration, 'days')
      },
      duration
    }
  },

  computed: {
    ...mapGetters(['trns']),

    dateStart() {
      return moment(this.date.start, 'DD.MM.YY').startOf('day').valueOf()
    },

    // Data end
    dateEnd() {
      let dateEnd
      if (this.date.add) {
        dateEnd = moment(this.date.start, 'DD.MM.YY').add(this.date.add[0], this.date.add[1]).valueOf()
      } else if (this.date.end) {
        dateEnd = moment(this.date.end, 'DD.MM.YY').endOf('day').valueOf()
      } else {
        dateEnd = moment().endOf('day').valueOf()
      }
      return dateEnd
    },

    trnsList() {
      return this.trns.filter(trn =>
        trn.categoryId !== 62 && // disable category 'Перевод'
        moment(trn.date) >= this.dateStart &&
        moment(trn.date) <= this.dateEnd
      )
    },

    incomesTrns() {
      return this.trnsList.filter(trn => trn.type === 1)
    },

    incomesTotal() {
      return this.countTotalTrns(this.incomesTrns)
    },

    expensesTrns() {
      return this.trnsList.filter(trn => trn.type === 0)
    },

    expensesTotal() {
      return this.countTotalTrns(this.expensesTrns)
    },

    // Incomes data
    incomesDataChart() {
      if (this.incomesTrns.length > 0) {
        const incomesDataSorted = this.dataInCategory(this.incomesTrns)
        return this.formatDataForChart(incomesDataSorted)
      }
      return false
    },

    // Expenses data
    expensesDataChart() {
      if (this.expensesTrns.length > 0) {
        const expensesDataSorted = this.dataInCategory(this.expensesTrns)
        return this.formatDataForChart(expensesDataSorted)
      }
      return false
    },

    // Pie data
    pieDataChart() {
      return this.formatDataForPieChart(this.expensesTotal, this.incomesTotal)
    }
  },

  methods: {
    changeDuration() {
      switch (this.duration) {
        case 3:
          this.date.start = moment().subtract(7, 'days')
          this.duration = 7
          break
        case 7:
          this.date.start = moment().subtract(14, 'days')
          this.duration = 14
          break
        case 14:
          this.date.start = moment().subtract(30, 'days')
          this.duration = 30
          break
        case 30:
          this.date.start = moment().subtract(3, 'days')
          this.duration = 3
          break
        default:
          this.date.start = moment().subtract(7, 'days')
          this.duration = 7
      }
    }
  },


  components: { TrnItem, Chart }
}
</script>
