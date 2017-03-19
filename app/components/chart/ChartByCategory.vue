<template lang="pug">
.panel
  Chart(
    chartType="area",
    :chartTitle="chartTitle",
    :data="chartData"
  )
</template>

<script>
import { mapGetters } from 'vuex'
import uniqBy from 'lodash/uniqBy'
import moment from 'moment'
import formatDataForCharts from '../../mixins/formatDataForCharts'
import Chart from '../chart/Chart.vue'

export default {
  mixins: [formatDataForCharts],

  // props
  // ==============================================
  props: {
    categoryId: {
      type: Number,
      required: true
    }
  },

  computed: {
    ...mapGetters(['trns', 'categories']),

    chartTitle() {
      const startDate = moment().subtract(6, 'year').format('MMMM YY')
      const endDate = moment().format('MMMM YY')
      return `${endDate} - ${startDate}`
    },

    chartData() {
      // trns by period
      const startDate = moment().subtract(6, 'year').startOf('month')
      const endDate = moment().endOf('month')

      const trns = this.trns
        .filter(trn =>
          trn.categoryId === this.categoryId &&
          moment(trn.date) >= startDate &&
          moment(trn.date) <= endDate
        )

      // find uniq dates and get ids
      const uniqDates = uniqBy(trns, trn => moment(trn.date).format('MM.YY')).map(trn => moment(trn.date).format('MM.YY'))

      console.log(startDate.diff(endDate, 'months'))
      // const total = this.countTotalTrns(trns) / uniqDates.length

      // create data for series
      const data = uniqDates.map((date) => {
        const trnInCategory = trns.filter(trn => moment(trn.date).format('MM.YY') === date)

        const incomesTrns = trnInCategory.filter(trn => trn.type === 1)
        const incomesTotal = incomesTrns
          .reduce((sum, current) => sum + Math.round(current.amountRub), 0)

        const expensesTrns = trnInCategory.filter(trn => trn.type === 0)
        const expensesTotal = expensesTrns
          .reduce((sum, current) => sum + Math.round(current.amountRub), 0)

        return {
          names: moment(date, 'MM.YY').format('M.YY'),
          incomes: incomesTotal,
          expenses: expensesTotal
        }
      })

      return {
        categories: data.map(d => d.names),
        series: [{
          name: 'Рассход',
          data: data.map(d => d.expenses),
          color: this.getColorByCategory(this.categories.find(c => c.id === this.categoryId).name)
        }, {
          name: 'Приход',
          data: data.map(d => d.incomes),
          color: this.getColorByCategory(this.categories.find(c => c.id === this.categoryId).name)
        }]
      }
    }
  },

  components: { Chart }
}
</script>
