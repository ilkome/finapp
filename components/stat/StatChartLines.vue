<script>
import { Chart } from 'highcharts-vue'
import chartOptions from '~/components/stat/chartOptions'

export default {
  name: 'StatChartLines',

  components: {
    Chart
  },

  props: {
    isShowIncomes: {
      type: Boolean,
      default: true
    },

    isShowExpenses: {
      type: Boolean,
      default: true
    },

    chartColor: {
      type: String,
      default: null
    },

    chartType: {
      type: String,
      default: 'line'
    },

    categoryId: {
      type: String,
      default: null
    },

    amountType: {
      type: String,
      default: null
    },

    isShowDataLabels: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    chartData () {
      const periodName = this.$store.state.filter.period
      const chartPeriods = this.$store.state.chart.periods
      const trns = this.$store.state.trns.items
      const vm = this

      // diff periods from oldest trn and today
      const oldestTrnDate = this.$day(trns[this.$store.getters['trns/firstCreatedTrnId']].date).endOf(periodName)
      let periodsToShow = this.$day().endOf(periodName).diff(oldestTrnDate, periodName) + 1
      const periodsWantToShow = chartPeriods[periodName].showedPeriods
      periodsToShow = periodsWantToShow >= periodsToShow ? periodsToShow : periodsWantToShow

      const categories = []
      const incomesData = []
      const expensesData = []
      const totalData = []

      for (let index = 0; index < periodsToShow; index++) {
        // count total period
        const periodDate = this.$day().endOf(periodName).subtract(index, periodName).valueOf()
        const trnsIds = this.$store.getters['trns/getTrns']({
          date: periodDate,
          periodName,
          categoryId: this.categoryId
        })
        const periodTotal = this.$store.getters['trns/getTotalOfTrnsIds'](trnsIds)

        let format = 'MM'
        if (periodName === 'day') { format = 'D.MM' }
        if (periodName === 'week') { format = 'D MMM' }
        if (periodName === 'month') { format = 'MMM' }
        if (periodName === 'year') { format = 'YYYY' }
        const name = this.$day().startOf(periodName).subtract(index, periodName).format(format)

        // Incomes
        incomesData.unshift({
          date: periodDate,
          y: Number(`${periodTotal.incomes.toFixed()}`)
        })
        // Expenses
        expensesData.unshift({
          date: periodDate,
          y: Number(`${periodTotal.expenses.toFixed()}`)
        })
        // Total
        totalData.unshift({
          date: periodDate,
          y: Number(`${(periodTotal.total).toFixed()}`)
        })
        categories.unshift(name)
      }

      let periods = 0
      let periodsTotalIncomes = 0
      for (const iterator of incomesData) {
        if (iterator.y !== 0) {
          periods = periods + 1
          periodsTotalIncomes = periodsTotalIncomes + iterator.y
        }
      }
      let periodsExpenses = 0
      let periodsTotalExpenses = 0
      for (const iterator of expensesData) {
        if (iterator.y !== 0) {
          periodsExpenses = periodsExpenses + 1
          periodsTotalExpenses = periodsTotalExpenses + iterator.y
        }
      }

      const data = {
        series: [{
          zIndex: 3,
          visible: periodsTotalIncomes > 0 && this.isShowIncomes,
          type: this.chartType,
          name: this.$t('money.incomes'),
          color: this.chartColor || 'var(--c-incomes-1)',
          data: incomesData,
          marker: {
            lineColor: 'var(--c-incomes-1)'
          }
        }, {
          zIndex: 2,
          visible: periodsTotalExpenses > 0 && this.isShowExpenses,
          type: this.chartType,
          name: this.$t('money.expenses'),
          color: this.chartColor || 'var(--c-expenses-1)',
          data: expensesData,
          marker: {
            lineColor: 'var(--c-expenses-1)'
          }
        }, {
          zIndex: 1,
          visible: false,
          type: 'areaspline',
          name: this.$t('money.total'),
          color: '#c1c1c1',
          data: totalData,
          marker: {
            lineColor: '#c1c1c1'
          }
        }],
        categories,
        averageIncomes: periodsTotalIncomes / periods,
        averageExpenses: periodsTotalExpenses / periodsExpenses
      }

      return {
        ...chartOptions,
        series: data.series,

        xAxis: {
          ...chartOptions.xAxis,
          categories: data.categories
          // plotBands: [{
          //   color: 'orange', // Color value
          //   from: `${this.selectedIndex}.5`, // Start of the plot band
          //   to: `${this.selectedIndex + 1}.5` // End of the plot band
          // }]
        },

        yAxis: {
          ...chartOptions.yAxis,
          plotLines: [{
            opacity: 0.3,
            color: 'var(--c-expenses-opacity)',
            value: data.averageExpenses,
            width: '1',
            zIndex: 1
          }, {
            opacity: 0.3,
            color: 'var(--c-incomes-opacity)',
            value: data.averageIncomes,
            width: '1',
            zIndex: 1
          }]
        },

        chart: {
          ...chartOptions.chart,
          height: '200',

          events: {
            click (e) {
              const value = this.series[0].searchPoint(e, true) || this.series[1].searchPoint(e, true)
              vm.$store.dispatch('filter/setDate', parseInt(value.date))
            }
          }
        },

        plotOptions: {
          ...chartOptions.plotOptions,
          series: {
            ...chartOptions.plotOptions.series,
            dataLabels: {
              ...chartOptions.plotOptions.series.dataLabels,
              enabled: this.isShowDataLabels
            },
            cursor: 'pointer',
            point: {
              events: {
                click () {
                  vm.$store.dispatch('filter/setDate', parseInt(this.date))
                }
              }
            }
          }
        },

        tooltip: this.$store.state.ui.pc ? chartOptions.tooltip : false
      }
    }
  }
}
</script>

<template lang="pug">
.chart
  Chart(:options="chartData")
</template>

<style lang="stylus" scoped>
.chart
  z-index 3
  position relative
</style>
