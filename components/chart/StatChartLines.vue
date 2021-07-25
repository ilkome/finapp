<script>
import { ref, computed, watch, nextTick, useContext } from '@nuxtjs/composition-api'
import { Chart } from 'highcharts-vue'
import chartOptions from '~/components/stat/chartOptions'
import useChart from '~/components/chart/useChart'
import useFilter from '~/modules/filter/useFilter'

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

    disableCategoryFilter: {
      type: Boolean,
      default: false
    },

    isShowExpenses: {
      type: Boolean,
      default: true
    },

    chartColor: {
      type: String,
      default: null
    },

    categoryId: {
      type: String,
      default: null
    },

    amountType: {
      type: String,
      default: null
    }
  },

  setup () {
    const { store, app: { $day } } = useContext()
    const { isShowDataLabels } = useChart()
    const { filterPeriodNameAllReplacedToYear } = useFilter()

    const periods = computed(() => store.state.chart.periods)
    const chartType = computed(() => {
      let type = null
      periods.value[filterPeriodNameAllReplacedToYear.value].grouped
        ? type = 'column'
        : type = 'spline'

      return type
    })

    const chartObj = ref({})
    const chartCallback = (v) => { chartObj.value = v }

    const onClickChart = (event) => {
      const chart = chartObj.value
      if (!chart)
        return

      const nEvent = chart.pointer.normalize(event)
      const value = chart.series[0].searchPoint(nEvent, true) || chart.series[0].searchPoint(nEvent, false) || chart.series[1].searchPoint(nEvent, true)

      if (value) {
        if (store.state.filter.period === 'all')
          store.dispatch('filter/setPeriod', 'year')
        if (value.date)
          store.dispatch('filter/setDate', parseInt(value.date))
      }
    }

    watch(() => store.state.filter.date, async (date) => {
      await nextTick()
      const chart = chartObj.value
      if (!chartObj.value)
        return

      let format = 'MM'
      if (filterPeriodNameAllReplacedToYear.value === 'day') format = 'D.MM'
      if (filterPeriodNameAllReplacedToYear.value === 'week') format = 'D MMM'
      if (filterPeriodNameAllReplacedToYear.value === 'month') format = 'MMM'
      if (filterPeriodNameAllReplacedToYear.value === 'year') format = 'YYYY'
      const name = $day(date).format(format)

      const index = chart.xAxis && chart?.xAxis[0].categories.indexOf(name)
      chart.xAxis[0].update({
        plotBands: [{
          color: 'var(--c-bg-7)',
          from: index + 0.5,
          to: index - 0.5
        }]
      })
    }, { immediate: true })

    return {
      onClickChart,
      chartCallback,
      isShowDataLabels,
      filterPeriodNameAllReplacedToYear,
      chartType
    }
  },

  computed: {
    chartData () {
      const periodName = this.filterPeriodNameAllReplacedToYear
      const chartPeriods = this.$store.state.chart.periods
      const trns = this.$store.state.trns.items

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
          categoryId: null,
          disableCategoryFilter: this.disableCategoryFilter
        })
        const periodTotal = this.$store.getters['trns/getTotalOfTrnsIds'](trnsIds)

        let format = 'MM'
        if (periodName === 'day') format = 'D.MM'
        if (periodName === 'week') format = 'D MMM'
        if (periodName === 'month') format = 'MMM'
        if (periodName === 'year') format = 'YYYY'
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
            lineColor: this.categoryId ? this.$store.state.categories.items[this.categoryId].color : 'var(--c-incomes-1)'
          }
        }, {
          zIndex: 2,
          visible: periodsTotalExpenses > 0 && this.isShowExpenses,
          type: this.chartType,
          name: this.$t('money.expenses'),
          color: this.chartColor || 'var(--c-expenses-1)',
          data: expensesData,
          marker: {
            lineColor: this.categoryId ? this.$store.state.categories.items[this.categoryId].color : 'var(--c-expenses-1)'
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

      const tooltip = this.$store.state.ui.pc ? { ...chartOptions.tooltip } : { enabled: false }

      return {
        ...chartOptions,
        legend: false,
        tooltip,

        series: data.series,

        xAxis: {
          ...chartOptions.xAxis,
          categories: data.categories
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
          height: '180'
        },

        plotOptions: {
          ...chartOptions.plotOptions,
          series: {
            ...chartOptions.plotOptions.series,
            dataLabels: {
              ...chartOptions.plotOptions.series.dataLabels,
              enabled: this.isShowDataLabels
            }
          }
        }
      }
    }
  }
}
</script>

<template lang="pug">
.chart(@click="onClickChart")
  Chart(:options="chartData" :callback="chartCallback")
</template>

<style lang="stylus" scoped>
.chart
  z-index 3
  position relative
</style>
