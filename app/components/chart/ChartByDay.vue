<template lang="pug">
div
  .panel
    .panelChart
      Chart(:data="seriesThisWeek")
</template>

<script>
import { mapGetters } from 'vuex'
import uniqBy from 'lodash/uniqBy'
import moment from 'moment'
import formatMoney from '../../mixins/money'
import Chart from '../chart/Chart.vue'

function getColorByCategory(categoryName) {
  switch (categoryName) {
    case 'Козачка': return '#E67E22'
    case 'Питание': return '#e53935'
    case 'Спорт': return '#3498db'
    case 'Авто/Бензин': return '#6d4c41'
    case 'Тинькофф': return '#1c2833'
    default:
      return '#808080'
  }
}

export default {
  mixins: [formatMoney],

  computed: {
    ...mapGetters(['trns', 'categories']),

    // data for chart
    seriesThisWeek() {
      // trns by period
      const startDate = moment(this.$store.state.filter.date).startOf('day').valueOf()
      const endDate = moment(this.$store.state.filter.date).endOf('day').valueOf()
      console.log(moment(startDate).format(), moment(endDate).format())

      const trns = this.trns
        .filter(trn =>
          trn.categoryId !== 62 &&
          moment(trn.date) >= startDate &&
          moment(trn.date) <= endDate
        )

      // find uniq categories and get ids
      const uniqCategoriesIds = uniqBy(trns, 'categoryName').map(trn => trn.categoryId)


      // create data for series
      const data = uniqCategoriesIds.map((id) => {
        const trnInCategory = trns.filter(trn => trn.categoryId === id)
        const incomesTrns = trnInCategory.filter(trn => trn.type === 1)
        const incomesTotal = incomesTrns.reduce((sum, current) => sum + current.amountRub, 0)
        const expensesTrns = trnInCategory.filter(trn => trn.type === 0)
        const expensesTotal = expensesTrns.reduce((sum, current) => sum + current.amountRub, 0)
        return {
          categoryName: this.categories.find(c => c.id === id).name,
          incomes: incomesTotal,
          expenses: expensesTotal,
          biggest: (incomesTotal > expensesTotal) ? incomesTotal : expensesTotal
        }
      })


      // sort data by biggest value in category
      const dataSorted = data.sort((a, b) => {
        if (a.biggest > b.biggest) return -1
        else if (a.biggest < b.biggest) return 1
        return 0
      })


      return {
        type: 'column',
        title: 'Статистика за этот день',
        categories: dataSorted.map(d => d.categoryName),
        series: [{
          name: 'Рассход',
          data: dataSorted.map(d => ({
            y: d.expenses,
            color: getColorByCategory(d.categoryName)
          }))
        }, {
          name: 'Приход',
          data: dataSorted.map(d => ({
            y: d.incomes,
            color: getColorByCategory(d.categoryName)
          })),
        }]
      }
    }
  },

  components: { Chart }
}
</script>
