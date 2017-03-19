<template lang="pug">
div
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

    h2.panelTitle._minus Транзакции
    template(v-for="(trn, index) in trnsList.slice(0, 10)")
      .trnsDay
        h3(v-if="!isSameDay(index)") {{ trn.date | date}}
        TrnItem(:trn="trn", :key="trn.id")

  template(v-else)
    div Нет транзакций

</template>


<script>
import { mapGetters } from 'vuex'
import uniqBy from 'lodash/uniqBy'
import moment from 'moment'
import formatMoney from '../../mixins/money'
import Chart from '../chart/Chart.vue'
import TrnItem from '../trn/TrnItem.vue'


export default {
  mixins: [formatMoney],

  // props
  // ==============================================
  props: {
    date: {
      type: Object,
      default: {
        start: moment().startOf('day').valueOf()
      }
    },
    duration: {
      type: Number,
      default: 1
    }
  },

  // computed
  // ==============================================
  computed: {
    ...mapGetters(['trns', 'incomes', 'expenses', 'categories']),

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
      return {
        series: [{
          data: [{
            y: this.incomesTotal,
            color: '#1e7a45'
          }, {
            y: this.expensesTotal,
            color: '#a73b2f'
          }]
        }]
      }
    }
  },

  // methods
  // ==============================================
  methods: {
    isSameDay(index) {
      const curDay = moment(this.trnsList[index].date).startOf('day').format()
      if (this.trnsList[index - 1]) {
        const prevDay = moment(this.trnsList[index - 1].date).startOf('day').format()
        if (curDay === prevDay)
          return true
      }
      return false
    },

    dataInCategory(trns) {
      const catsIds = uniqBy(trns, 'categoryName').map(trn => trn.categoryId)
      const data = catsIds.map((id) => {
        const trnsInCat = trns.filter(trn => trn.categoryId === id)
        const totalInCat = trnsInCat.reduce((sum, current) => sum + current.amountRub, 0)
        return {
          categoryName: this.categories.find(c => c.id === id).name,
          total: totalInCat
        }
      })
      // sort data by biggest value in category
      const dataSorted = data.sort((a, b) => {
        if (a.total > b.total) return -1
        else if (a.total < b.total) return 1
        return 0
      })
      return dataSorted
    },

    countTotalTrns(trns) {
      return trns.reduce((sum, current) => sum + current.amountRub, 0)
    },

    getColorByCategory(categoryName) {
      switch (categoryName) {
        case 'Козачка': return '#9b5619'
        case 'Плюшки': return '#007037'
        case 'Питание': return '#6c26b0'
        case 'Авто/Бензин': return '#6D4C41'
        case 'Тинькофф': return '#1c2833'
        default: return '#242424'
      }
    },

    formatDataForChart(trns) {
      return {
        categories: trns.map(d => d.categoryName),
        series: [{
          data: trns.map(d => ({
            y: d.total,
            color: this.getColorByCategory(d.categoryName)
          }))
        }]
      }
    }
  },

  components: { Chart, TrnItem }
}
</script>
