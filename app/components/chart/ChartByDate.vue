<template lang="pug">

div
  template(v-if="trnsList.length")
    .infoTable
      .infoTable__cell
        .accountDetails._small
          .accountContentItem
            .accountContentItemLabel Рассход
            .accountContentItemTotal.expense
              div {{ formatMoney(dataChart.expensesTotal) }}
              template(v-if="duration > 1")
                div {{ formatMoney(dataChart.expensesTotal / duration) }}
          .accountContentItem
            .accountContentItemLabel Приход
            .accountContentItemTotal.income
              div {{ formatMoney(dataChart.incomesTotal) }}
              template(v-if="duration > 1")
                div {{ formatMoney(dataChart.incomesTotal / duration) }}
          .accountContentItem
            .accountContentItemLabel Итого
            .accountContentItemTotal
              .accountContentItemTotalIn.sum
                div {{ formatMoney(dataChart.incomesTotal - dataChart.expensesTotal) }}
                template(v-if="duration > 1")
                  div {{ formatMoney((dataChart.incomesTotal - dataChart.expensesTotal) / duration) }}

      .infoTable__pie
        //- pre {{dataChart}}
        ChartPie(
          :incomes="dataChart.incomesTotal",
          :expenses="dataChart.expensesTotal")

    .panelCol
      template(v-if="dataExpenses.series.length > 0")
        .panel
          h2.panelTitle Рассходы
          .panelChart: Chart(:data="dataExpenses")

      template(v-if="dataIncomes.series.length > 0")
        .panel
          h2.panelTitle Поступления
          .panelChart: Chart(:data="dataIncomes")

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
import _ from 'lodash'
import moment from 'moment'
import formatMoney from '../../mixins/money'
import Chart from '../chart/Chart.vue'
import ChartPie from '../chart/ChartPie.vue'
import TrnItem from '../trn/TrnItem.vue'

function getColorByCategory(categoryName) {
  switch (categoryName) {
    case 'Козачка': return '#9b5619'
    case 'Плюшки': return '#007037'
    case 'Питание': return '#6c26b0'
    case 'Авто/Бензин': return '#6D4C41'
    case 'Тинькофф': return '#1c2833'
    default: return '#242424'
  }
}

// props
const chartType = 'column'

export default {
  mixins: [formatMoney],

  props: {
    date: Object,
    duration: {
      type: Number,
      default: 1
    }
  },

  data() {
    return {
      dataIncomes: [],
      dataExpenses: []
    }
  },

  computed: {
    ...mapGetters(['trns', 'categories']),

    trnsList() {
      return this.trns.filter(trn =>
        trn.categoryId !== 62 && // disable category 'Перевод'
        moment(trn.date) >= this.dateStart &&
        moment(trn.date) <= this.dateEnd
      )
    },

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
      const filteredTrns = this.trns
        .filter(trn =>
          trn.categoryId !== 62 && // disable category 'Перевод'
          moment(trn.date) >= this.dateStart &&
          moment(trn.date) <= this.dateEnd
        )
      let incomesTotal = 0

      // total incomes
      const incomesTrns = filteredTrns.filter(trn => trn.type === 1)

      if (incomesTrns.length > 0) {
        incomesTotal = incomesTrns
          .reduce((sum, current) => sum + current.amountRub, 0)
        const incomesCatsIds = _.uniqBy(incomesTrns, 'categoryName').map(trn => trn.categoryId)

        const incomesData = incomesCatsIds.map((id) => {
          const incomesTrnsInCat = incomesTrns.filter(trn => trn.categoryId === id)
          const incomesTotalInCat = incomesTrnsInCat
            .reduce((sum, current) => sum + current.amountRub, 0)
          return {
            categoryName: this.categories.find(c => c.id === id).name,
            total: incomesTotalInCat
          }
        })

        // sort data by biggest value in category
        const incomesDataSorted = incomesData.sort((a, b) => {
          if (a.total > b.total) return -1
          else if (a.total < b.total) return 1
          return 0
        })

        this.dataIncomes = {
          type: 'column',
          title: '',
          categories: incomesDataSorted.map(d => d.categoryName),
          series: [{
            name: 'Приход',
            data: incomesDataSorted.map(d => ({
              y: d.total,
              color: getColorByCategory(d.categoryName)
            }))
          }],
        }
      } else {
        this.dataIncomes.series = []
      }

      // total expenses
      const expensesTrns = filteredTrns.filter(trn => trn.type === 0)
      const expensesTotal = expensesTrns
        .reduce((sum, current) => sum + current.amountRub, 0)
      const expensesCatsIds = _.uniqBy(expensesTrns, 'categoryName').map(trn => trn.categoryId)

      const expensesData = expensesCatsIds.map((id) => {
        const expensesTrnsInCat = expensesTrns.filter(trn => trn.categoryId === id)
        const expensesTotalInCat = expensesTrnsInCat
          .reduce((sum, current) => sum + current.amountRub, 0)
        return {
          categoryName: this.categories.find(c => c.id === id).name,
          total: expensesTotalInCat
        }
      })

      // sort data by biggest value in category
      const expensesDataSorted = expensesData.sort((a, b) => {
        if (a.total > b.total) return -1
        else if (a.total < b.total) return 1
        return 0
      })

      this.dataExpenses = {
        type: 'column',
        title: '',
        categories: expensesDataSorted.map(d => d.categoryName),
        series: [{
          name: 'Рассход',
          data: expensesDataSorted.map(d => ({
            y: d.total,
            color: getColorByCategory(d.categoryName)
          }))
        }],
      }


      // find uniq categories and get array of ids
      const uniqCategoriesIds = _.uniqBy(filteredTrns, 'categoryName').map(trn => trn.categoryId)

      // create category data array for series
      const data = uniqCategoriesIds.map((id) => {
        const trnsInCategory = filteredTrns.filter(trn => trn.categoryId === id)

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
        title: '',
        categories: dataSorted.map(d => d.categoryName),
        series,
        incomesTotal,
        expensesTotal
      }
    }
  },

  methods: {
    isSameDay(index) {
      const curDay = moment(this.trnsList[index].date).startOf('day').format()
      if (this.trnsList[index - 1]) {
        const prevDay = moment(this.trnsList[index - 1].date).startOf('day').format()
        if (curDay === prevDay) {
          return true
        }
      }
      return false
    }
  },

  components: { Chart, ChartPie, TrnItem }
}
</script>
