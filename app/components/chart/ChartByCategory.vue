<template lang="pug">
.panel.last: .panelChart: Chart(:data="chartData")
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'
import moment from 'moment'
import formatMoney from '../../mixins/money'
import Chart from '../chart/Chart.vue'

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['trns', 'categories']),

    chartData() {
      // trns by period
      const startDate = moment().subtract(6, 'year').startOf('month').valueOf()
      const endDate = moment()
      // console.log('Categories', moment(startDate).format(), moment(endDate).format())

      const trns = this.trns
        .filter(trn =>
          trn.categoryId === 14 &&
          moment(trn.date) >= startDate &&
          moment(trn.date) <= endDate
        )

      // find uniq dates and get ids
      const uniqDates = _.uniqBy(trns, trn => moment(trn.date).format('MM.YY')).map(trn => moment(trn.date).format('MM.YY'))

      // create data for series
      const data = uniqDates.map((date) => {
        const trnInCategory = trns.filter(trn => moment(trn.date).format('MM.YY') === date)

        const incomesTrns = trnInCategory.filter(trn => trn.type === 1)
        const incomesTotal = incomesTrns.reduce((sum, current) => sum + Math.round(current.amountRub), 0)
        const expensesTrns = trnInCategory.filter(trn => trn.type === 0)
        const expensesTotal = expensesTrns.reduce((sum, current) => sum + Math.round(current.amountRub), 0)
        return {
          names: moment(date, 'MM.YY').format('MM.YY'),
          incomes: incomesTotal,
          expenses: expensesTotal
        }
      })

      return {
        type: 'area',
        title: this.categories.find(c => c.id === 14).name,
        categories: data.map(d => d.names),
        series: [{
          name: 'Рассход',
          data: data.map(d => d.expenses),
          color: '#e53935'
        }]
      }
    }
  },

  components: { Chart }
}
</script>
