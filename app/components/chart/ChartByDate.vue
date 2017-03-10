<template lang="pug">

div
  //- pre {{ dataChart.series }}
  .panel
    template(v-if="dataChart.series.length > 0")
      .panelChart: Chart(:data="dataChart")

  .accountDetails._small
    .accountContentItem
      .accountContentItemLabel Приход
      .accountContentItemTotal {{ formatMoney(dataChart.totalIncomes) }}
    .accountContentItem
      .accountContentItemLabel Рассход
      .accountContentItemTotal {{ formatMoney(dataChart.totalExpenses) }}

  .accountDetails._small
    .accountDetailsIn
      .accountContentItem(v-for="(category, index) in dataChart.categories")
        .accountContentItemLabel {{ category }}
        .accountContentItemTotal {{ formatMoney(dataChart.series[0].data[index].y - dataChart.series[1].data[index].y) }}
</template>


<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'
import moment from 'moment'
import formatMoney from '../../mixins/money'
import Chart from '../chart/Chart.vue'

function getColorByCategory(categoryName, income) {
  switch (categoryName) {
    case 'Козачка': return income ? 'rgba(230, 126, 34, 1)' : 'rgba(230, 126, 34, 1)'
    case 'Питание': return income ? 'rgba(231, 76, 60, 1)' : 'rgba(221, 66, 80, 1)'
    case 'Спорт': return '#3498db'
    case 'Авто/Бензин': return income ? 'rgba(147, 81, 22, 1)' : 'rgba(147, 81, 22, 1)'
    case 'Тинькофф': return '#1c2833'
    default: return '#808080'
  }
}

// props
const chartType = 'column'

export default {
  mixins: [formatMoney],

  props: {
    date: Object
  },

  computed: {
    ...mapGetters(['trns', 'categories']),

    chartTitle() {
      return `${moment(this.dateStart).format('DD.MM.YY')} - ${moment(this.dateEnd).format('DD.MM.YY')}`
    },

    dateStart() {
      return moment(this.date.start, 'DD.MM.YY').startOf('day').valueOf()
    },

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

    dataChart() {
      // console.log('chartTitle', this.chartTitle)
      // console.log('dateStart', this.dateStart)
      // console.log('dateEnd', this.dateEnd)

      const trns = this.trns
        .filter(trn =>
          trn.categoryId !== 62 && // disable category 'Перевод'
          moment(trn.date) >= this.dateStart &&
          moment(trn.date) <= this.dateEnd
        )

      // total incomes
      const totalIncomes = trns
        .filter(trn => trn.type === 1)
        .reduce((sum, current) => sum + current.amountRub, 0)

      // total incomes
      const totalExpenses = trns
        .filter(trn => trn.type === 0)
        .reduce((sum, current) => sum + current.amountRub, 0)

      // find uniq categories and get array of ids
      const uniqCategoriesIds = _.uniqBy(trns, 'categoryName').map(trn => trn.categoryId)

      // create category data array for series
      const data = uniqCategoriesIds.map((id) => {
        const trnsInCategory = trns.filter(trn => trn.categoryId === id)

        const incomesInCategory = trnsInCategory
          .filter(trn => trn.type === 1)
          .reduce((sum, current) => sum + current.amountRub, 0)

        const expensesInCategory = trnsInCategory
          .filter(trn => trn.type === 0)
          .reduce((sum, current) => sum + current.amountRub, 0)

        return {
          categoryName: this.categories.find(c => c.id === id).name,
          incomes: incomesInCategory,
          expenses: expensesInCategory,
          biggest: (incomesInCategory > expensesInCategory) ? incomesInCategory : expensesInCategory
        }
      })

      // sort data by biggest value in category
      const dataSorted = data.sort((a, b) => {
        if (a.biggest > b.biggest) return -1
        else if (a.biggest < b.biggest) return 1
        return 0
      })

      const dataSeriesIncomes = {
        name: 'Приход',
        data: dataSorted.map(d => ({
          y: d.incomes,
          color: getColorByCategory(d.categoryName, 'income')
        }))
      }
      const haveDataSeriesIncomes = dataSeriesIncomes.data.filter(d => d.y > 0)

      const dataSeriesExpenses = {
        name: 'Рассход',
        data: dataSorted.map(d => ({
          y: d.expenses,
          color: getColorByCategory(d.categoryName)
        }))
      }
      const haveDataSeriesExpenses = dataSeriesExpenses.data.filter(d => d.y > 0)

      const series = []
      if (haveDataSeriesIncomes.length > 0) series.push(dataSeriesIncomes)
      if (haveDataSeriesExpenses.length > 0) series.push(dataSeriesExpenses)

      return {
        type: chartType,
        title: this.chartTitle,
        categories: dataSorted.map(d => d.categoryName),
        series,
        totalIncomes,
        totalExpenses
      }
    }
  },

  components: { Chart }
}
</script>
