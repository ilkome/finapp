<template lang="pug">
.panel
  Chart(chartType="area", :chartTitle="chartTitle", :data="chartData")
</template>

<script>
import { mapGetters } from 'vuex'
import uniqBy from 'lodash/uniqBy'
import moment from 'moment'
import Chart from '../chart/Chart.vue'

export default {
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
      const startDate = moment().subtract(6, 'year').startOf('month').valueOf()
      const endDate = moment()
      // console.log('Categories', moment(startDate).format(), moment(endDate).format())

      const trns = this.trns
        .filter(trn =>
          trn.categoryId === this.categoryId &&
          moment(trn.date) >= startDate &&
          moment(trn.date) <= endDate
        )

      // find uniq dates and get ids
      const uniqDates = uniqBy(trns, trn => moment(trn.date).format('MM.YY')).map(trn => moment(trn.date).format('MM.YY'))

      console.log(moment(startDate).diff(endDate, 'months'))
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
          data: data.map(d => d.expenses),
          color: 'red'
        }, {
          data: data.map(d => d.incomes),
          color: this.getColorByCategory(this.categories.find(c => c.id === this.categoryId).name)
        }]
      }
    }
  },

  methods: {
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
  },

  components: { Chart }
}
</script>
