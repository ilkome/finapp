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
    const { store } = useContext()
    const { isShowDataLabels } = useChart()
    const { filterPeriodNameAllReplacedToYear, scrollTop } = useFilter()

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

    const onClickChart = async (event) => {
      const chart = chartObj.value
      if (!chart)
        return

      const nEvent = await chart.pointer.normalize(event)
      let date = chart.series[0].searchPoint(nEvent, true)?.date || chart.series[1].searchPoint(nEvent, true)?.date || chart.series[2].searchPoint(nEvent, true)?.date
      setTimeout(() => {
        date = chart.series[0].searchPoint(nEvent, true)?.date || chart.series[1].searchPoint(nEvent, true)?.date || chart.series[2].searchPoint(nEvent, true)?.date
        if (date) {
          if (store.state.filter.period === 'all')
            store.dispatch('filter/setPeriod', 'year')

          store.dispatch('filter/setDate', parseInt(date))
          scrollTop()
        }
      }, 100)
    }

    watch(() => store.state.filter.date, async () => {
      await nextTick()

      const chart = chartObj.value
      if (!chartObj.value)
        return

      const chartSeriesIdx = chart.series[0].options.data.findIndex(v => +v.date === +store.state.filter.date)
      if (chartSeriesIdx !== -1) {
        chart.xAxis[0].update({
          plotBands: [{
            color: 'var(--c-item-bg-active)',
            from: chartSeriesIdx + 0.5,
            to: chartSeriesIdx - 0.5
          }]
        })
      }
    }, { immediate: true })

    return {
      onClickChart,
      chartCallback,
      isShowDataLabels,
      chartType,
      filterPeriodNameAllReplacedToYear,
      scrollTop
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
        const periodDate = this.$day().startOf(periodName).subtract(index, periodName).valueOf()
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

      const fakeLineDate = expensesData.map(i => ({ date: i.date, y: periodsTotalIncomes / periods || periodsTotalExpenses / periodsExpenses }))

      const data = {
        series: [{
          zIndex: 3,
          visible: periodsTotalIncomes > 0 && this.isShowIncomes,
          type: this.chartType,
          name: this.$t('money.incomes'),
          color: 'var(--c-incomes-1)',
          data: incomesData,
          marker: {
            lineColor: 'var(--c-incomes-1)'
          }
        }, {
          zIndex: 2,
          visible: periodsTotalExpenses > 0 && this.isShowExpenses,
          type: this.chartType,
          name: this.$t('money.expenses'),
          color: 'var(--c-expenses-1)',
          data: expensesData,
          marker: {
            lineColor: 'var(--c-expenses-1)'
          }
        // Fake data to make good hover on bar chart
        }, {
          zIndex: 1,
          visible: true,
          type: 'line',
          name: '',
          color: 'transparent',
          data: fakeLineDate,
          marker: {
            enabled: false,
            symbol: 'circle',
            radius: 0,
            lineWidth: 0,
            states: {
              hover: {
                fillColor: 'transparent',
                lineColor: 'transparent',
                lineWidth: 0
              }
            }
          },
          dataLabels: {
            enabled: false
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
            opacity: 0.5,
            color: 'var(--c-expenses-opacity)',
            value: data.averageExpenses,
            width: '2',
            zIndex: 1
          }, {
            opacity: 0.5,
            color: 'var(--c-incomes-opacity)',
            value: data.averageIncomes,
            width: '2',
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
  Chart(
    :options="chartData"
    :callback="chartCallback"
  )
</template>

<style lang="stylus" scoped>
.chart
  z-index 3
  position relative
</style>
