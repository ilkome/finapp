<script>
import { Chart } from 'highcharts-vue'
import chartOptions from '~/components/stat/chartOptions'

export default {
  name: 'StatChartDonut5',

  components: {
    Chart
  },

  props: {
    categoryId: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    type: {
      type: Number,
      default: 3
    },
    averageIncomes: {
      type: Number,
      default: 0
    },
    averageExpenses: {
      type: Number,
      default: 0
    }
  },

  data () {
    const vm = this
    return {
      date: this.$day().valueOf(),
      periodName: 'month',
      visiblePeriodMenu: false,
      dateStart: null,
      dateEnd: null,
      chartOptions: {
        ...chartOptions,
        legend: false,
        tooltip: false,
        chart: {
          events: {
            click (e) {
              // const value = this.series[0].searchPoint(e, true) || this.series[1].searchPoint(e, true) || this.series[2].searchPoint(e, true)
              // vm.$store.dispatch('filter/setDate', parseInt(value.date))
            }
          }
        }
      }
    }
  },

  computed: {
    activeTab () {
      return this.$store.state.dashboard.activeTab === 'balance'
    }
  },

  watch: {
    activeTab (isShow) {
      if (isShow) {
        // this.chartOptions.chart.redraw()
      }
    }
  },

  mounted () {
    const data = this.generateData(this.$store.state.filter.period)
    const handlePerioSelect = date => this.$store.dispatch('filter/setDate', parseInt(date))
    this.chartOptions.series = data.series
    this.chartOptions.plotOptions.series = {
      cursor: 'pointer',
      point: {
        events: {
          click () {
            // handlePerioSelect(this.date)
          }
        }
      }
    }

    this.chartOptions = {
      ...this.chartOptions,
      xAxis: {
        categories: data.categories,
        labels: false,
        // labels: {
        //   style: {
        //     textOutline: 'var(--c-bg-1)',
        //     fontSize: '8px',
        //     fontFamily: 'var(--font-secondary)',
        //     fontWeight: 400,
        //     textTransform: 'uppercase'
        //   }
        // }

        // plotLines: [{
        //   color: 'var(--c-bg-9)',
        //   dashStyle: 'solid', // Style of the plot line. Default to solid
        //   value: 2, // Value of where the line will appear
        //   width: 6, // Width of the line
        //   zIndex: 1
        // }]
      },

      yAxis: {
        labels: false,
        plotLines: [{
          opacity: 0.3,
          color: 'var(--c-expenses-opacity)',
          value: this.averageExpenses, // Insert your average here
          width: '1',
          zIndex: 1
        }, {
          opacity: 0.3,
          color: 'var(--c-incomes-opacity)',
          value: this.averageIncomes, // Insert your average here
          width: '1',
          zIndex: 1
        }]
      },

      chart: {
        tooltip: false,
        legend: false,
        backgroundColor: 'transparent',
        with: '100%',
        height: '36',
        spacing: [0, 0, 5, 5],
        type: 'column',
        zoomType: 'x',
        panning: true,
        panKey: 'shift'
      }
    }
  },

  methods: {
    changePeriod (name) {
      if (this.periodName !== name) {
        this.periodName = name
        const data = this.generateData(this.periodName, this.chartOptions.series)
        this.chartOptions.series = data.series
        this.chartOptions.xAxis.categories = data.categories
      }
    },

    formatAmount (amount) {
      const fixed = this.$store.state.currencies.base === 'RUB' ? 0 : 2
      return Number(`${amount.toFixed(fixed)}`).toLocaleString('ru-RU')
    },

    generateData (periodName, oldSeries) {
      const trns = this.$store.state.trns.items
      // const allTrnsIds = Object.keys(trns)

      // diff periods from oldest trn and today
      const oldestTrnDate = this.$day(trns[this.$store.getters['trns/firstCreatedTrnId']].date).endOf(periodName)
      let periodsToShow = this.$day().endOf(periodName).diff(oldestTrnDate, periodName) + 1
      periodsToShow = this.$store.state.chart.periods[periodName].showedPeriods >= periodsToShow ? periodsToShow : this.$store.state.chart.periods[periodName].showedPeriods
      // get balance for first period
      // const dateStart = this.$day().endOf(periodName).subtract(periodsToShow, periodName).valueOf()
      // const trnsIdsBeforeDate = allTrnsIds.filter(id => trns[id].date < dateStart)
      // const totalStart = this.$store.getters['trns/getTotalOfTrnsIds'](trnsIdsBeforeDate, true)

      const categories = []
      const incomesData = []
      const expensesData = []
      const totalData = []

      for (let index = 0; index < 4; index++) {
        // count balance
        // const balanceDateStart = this.$day().endOf(periodName).subtract(index, periodName).valueOf()
        // const balanceTrnsIds = allTrnsIds.filter(id => trns[id].date > dateStart && trns[id].date < balanceDateStart)
        // const balanceTotal = this.$store.getters['trns/getTotalOfTrnsIds'](balanceTrnsIds, true)

        // count total period
        const periodDate = this.$day().endOf(periodName).subtract(index, periodName).valueOf()
        const trnsIds = this.$store.getters['trns/getTrns']({ date: periodDate, periodName, categoryId: this.categoryId })
        const periodTotal = this.$store.getters['trns/getTotalOfTrnsIds'](trnsIds)

        let format = 'MM'
        if (periodName === 'day') { format = 'D.MM' }
        if (periodName === 'week') { format = 'D MMM' }
        if (periodName === 'month') { format = 'MMM' }
        if (periodName === 'year') { format = 'YYYY' }
        const name = this.$day().startOf(periodName).subtract(index, periodName).format(format)

        // return
        incomesData.unshift({
          date: periodDate,
          y: Number(`${periodTotal.incomes.toFixed()}`)
        })
        expensesData.unshift({
          date: periodDate,
          y: Number(`${periodTotal.expenses.toFixed()}`)
        })
        // totalData.unshift({
        //   date: periodDate,
        //   y: Number(`${(totalStart.total + balanceTotal.total).toFixed()}`)
        // })
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

      return {
        series: [{
          // zIndex: 3,
          visible: periodsTotalIncomes > 0 && this.type === 1,
          type: 'bar',
          name: this.$t('money.incomes'),
          color: this.color,
          borderWidth: 0,
          data: incomesData,
          groupPadding: 0,
          pointPadding: 0.2,
          marker: {
            radius: 2,
            fillColor: 'var(--c-bg-4)',
            lineWidth: 2,
            lineColor: this.color,
            symbol: 'circle'
          },
          // dataLabels: {
          //   enabled: true,
          //   allowOverlap: false,
          //   shadow: false,
          //   color: 'var(--c-font-3)',
          //   backgroundColor: 'var(--c-bg-15)',
          //   align: 'center',
          //   borderRadius: 3,
          //   padding: 3,
          //   y: -8,
          //   style: {
          //     textOutline: 'var(--c-bg-1)',
          //     color: 'var(--c-bg-7)',
          //     fontSize: '10px',
          //     fontFamily: 'var(--font-secondary)',
          //     fontWeight: 400,
          //     textTransform: 'uppercase'
          //   }
          // }
        }, {
          // zIndex: 2,
          visible: periodsTotalExpenses > 0 && this.type === 0,
          type: 'bar',
          name: this.$t('money.expenses'),
          color: this.color,
          data: expensesData,
          borderWidth: 0,
          groupPadding: 0,
          pointPadding: 0.2,
          marker: {
            radius: 2,
            fillColor: 'var(--c-bg-4)',
            lineWidth: 2,
            lineColor: this.color,
            symbol: 'circle'
          },
          // dataLabels: {
          //   enabled: true,
          //   allowOverlap: false,
          //   shadow: false,
          //   color: 'var(--c-font-3)',
          //   borderColor: 'red',
          //   align: 'center',
          //   backgroundColor: 'var(--c-bg-15)',
          //   borderRadius: 3,
          //   padding: 3,
          //   y: -8,
          //   style: {
          //     textOutline: 'var(--c-bg-1)',
          //     fontSize: '10px',
          //     fontFamily: 'var(--font-secondary)',
          //     fontWeight: 400,
          //     textTransform: 'uppercase'
          //   }
          // }
        }],
        categories,
        // averageIncomes: periodsTotalIncomes / periods,
        // averageExpenses: periodsTotalExpenses / periodsExpenses
      }
    }
  }
}
</script>

<template lang="pug">
.chart
  Chart(:options="chartOptions")
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/media"

$background = var(--c-bg-4)
$border = var(--c-bg-1)

.chart
  z-index 3
  position relative
</style>
