<script>
import { Chart } from 'highcharts-vue'
import chartOptions from '~/components/stat/chartOptions'

export default {
  name: 'StatChartDonut2',

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
    }
  },

  data () {
    const vm = this
    return {
      average: 0,
      date: this.$day().valueOf(),
      periodName: 'month',
      visiblePeriodMenu: false,
      dateStart: null,
      dateEnd: null,
      chartOptions: {
        ...chartOptions,
        tooltip: false,
        chart: {
          events: {
            click (e) {
              const value = this.series[0].searchPoint(e, true) || this.series[1].searchPoint(e, true)
              vm.$store.dispatch('filter/setDate', parseInt(value.date))
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
            handlePerioSelect(this.date)
          }
        }
      }
    }

    this.chartOptions = {
      ...this.chartOptions,
      xAxis: {
        categories: data.categories
        // plotLines: [{
        //   color: 'var(--c-bg-9)',
        //   dashStyle: 'solid', // Style of the plot line. Default to solid
        //   value: 2, // Value of where the line will appear
        //   width: 6, // Width of the line
        //   zIndex: 1
        // }]
      },

      yAxis: {
        plotLines: [{
          opacity: 0.3,
          color: 'var(--c-expenses-opacity)',
          value: data.averageExpenses, // Insert your average here
          width: '1',
          zIndex: 1
        }, {
          opacity: 0.3,
          color: 'var(--c-incomes-opacity)',
          value: data.averageIncomes, // Insert your average here
          width: '1',
          zIndex: 1
        }]
      },

      chart: {
        tooltip: false,
        backgroundColor: 'transparent',
        with: '100%',
        height: '200',
        spacing: [5, 0, 0, 0],
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
      const categoriesItems = this.$store.state.categories.items
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

      const series = []

      for (let index = 0; index < periodsToShow; index++) {
        // count balance
        // const balanceDateStart = this.$day().endOf(periodName).subtract(index, periodName).valueOf()
        // const balanceTrnsIds = allTrnsIds.filter(id => trns[id].date > dateStart && trns[id].date < balanceDateStart)
        // const balanceTotal = this.$store.getters['trns/getTotalOfTrnsIds'](balanceTrnsIds, true)

        // count total period
        const periodDate = this.$day().endOf(periodName).subtract(index, periodName).valueOf()
        const trnsIds = this.$store.getters['trns/getTrns']({ date: periodDate, periodName })
        const periodTotal = this.$store.getters['trns/getTotalOfTrnsIds'](trnsIds)

        const expensesTrnsIds = trnsIds.filter(trnId => trns[trnId].type === 0)
        const cat = this.$store.getters['stat/getCategoriesIdsWithTrnsIds']({ trnsIds: expensesTrnsIds })

        for (const catId in cat) {
          console.log(catId)
          // // return
          // series.unshift({
          //   name: 'h',
          //   data: {
          //     date: periodDate,
          //     y: Number(`${periodTotal.incomes.toFixed()}`)
          //   }
          // })
          // series.unshift({
          //   name: 'h2',
          //   data: {
          //     date: periodDate,
          //     y: Number(`${periodTotal.expenses.toFixed()}`)
          //   }
          // })
          // series.unshift({
          //   name: 'h3',
          //   data: {
          //     date: periodDate,
          //     y: Number(`${(periodTotal.total).toFixed()}`)
          //   }
          // })

        }

        let format = 'MM'
        if (periodName === 'day') { format = 'D.MM' }
        if (periodName === 'week') { format = 'D.MM' }
        if (periodName === 'month') { format = 'MMM' }
        if (periodName === 'year') { format = 'YYYY' }
        const name = this.$day(periodDate).format(format)

        categories.unshift(name)
      }

      return {
        series,
        // series: [{
        //   zIndex: 3,
        //   visible: periodsTotalIncomes > 0 && this.isShowIncomes,
        //   type: 'line',
        //   name: this.$t('money.incomes'),
        //   color: 'var(--c-incomes-1)',
        //   data: incomesData,
        //   marker: {
        //     radius: 3,
        //     fillColor: 'var(--c-bg-4)',
        //     lineWidth: 2,
        //     lineColor: 'var(--c-incomes-1)',
        //     symbol: 'circle'
        //   },

        //   dataLabels: {
        //     enabled: true,
        //     allowOverlap: false,
        //     shadow: false,
        //     color: 'var(--c-font-3)',
        //     backgroundColor: 'var(--c-bg-15)',
        //     align: 'center',
        //     borderRadius: 3,
        //     padding: 3,
        //     y: -8,
        //     style: {
        //       textOutline: 'var(--c-bg-1)',
        //       color: 'var(--c-bg-7)',
        //       fontSize: '10px',
        //       fontFamily: 'var(--font-secondary)',
        //       fontWeight: 400,
        //       textTransform: 'uppercase'
        //     }
        //   }
        // }, {
        //   zIndex: 2,
        //   visible: periodsTotalExpenses > 0 && this.isShowExpenses,
        //   type: 'line',
        //   name: this.$t('money.expenses'),
        //   color: 'var(--c-expenses-1)',
        //   data: expensesData,
        //   marker: {
        //     radius: 3,
        //     fillColor: 'var(--c-bg-4)',
        //     lineWidth: 2,
        //     lineColor: 'var(--c-expenses-1)',
        //     symbol: 'circle'
        //   },
        //   dataLabels: {
        //     enabled: true,
        //     allowOverlap: false,
        //     shadow: false,
        //     color: 'var(--c-font-3)',
        //     backgroundColor: 'var(--c-bg-15)',
        //     align: 'center',
        //     borderRadius: 3,
        //     padding: 3,
        //     y: -8,
        //     style: {
        //       textOutline: 'var(--c-bg-1)',
        //       color: 'var(--c-bg-7)',
        //       fontSize: '10px',
        //       fontFamily: 'var(--font-secondary)',
        //       fontWeight: 400,
        //       textTransform: 'uppercase'
        //     }
        //   }
        // }, {
        //   zIndex: 1,
        //   visible: false,
        //   type: 'areaspline',
        //   name: this.$t('money.total'),
        //   color: '#c1c1c1',
        //   data: totalData,
        //   marker: {
        //     radius: 3,
        //     fillColor: 'var(--c-bg-4)',
        //     lineWidth: 2,
        //     lineColor: '#c1c1c1',
        //     symbol: 'circle'
        //   },
        //   dataLabels: {
        //     enabled: true,
        //     allowOverlap: false,
        //     shadow: false,
        //     color: 'var(--c-font-3)',
        //     backgroundColor: 'var(--c-bg-15)',
        //     align: 'center',
        //     borderRadius: 3,
        //     padding: 3,
        //     y: -8,
        //     style: {
        //       textOutline: 'var(--c-bg-1)',
        //       color: 'var(--c-bg-7)',
        //       fontSize: '10px',
        //       fontFamily: 'var(--font-secondary)',
        //       fontWeight: 400,
        //       textTransform: 'uppercase'
        //     }
        //   }
        // }],
        categories,
        averageIncomes: periodsTotalIncomes / periods,
        averageExpenses: periodsTotalExpenses / periodsExpenses
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
