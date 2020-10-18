<script>
import dayjs from 'dayjs'
import { Chart } from 'highcharts-vue'
import Highcharts from 'highcharts'
import borderRadius from 'highcharts-border-radius'
import chartOptions from './chartOptions'

borderRadius(Highcharts)

export default {
  components: {
    Chart
  },

  data () {
    const vm = this
    return {
      date: dayjs().valueOf(),
      periodName: 'month',
      visiblePeriodMenu: false,
      dateStart: null,
      dateEnd: null,
      chartOptions: {
        ...chartOptions,
        chart: {
          events: {
            click (e) {
              const date = this.series[0].searchPoint(e, true).date
              vm.$store.dispatch('filter/setDate', parseInt(date))
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
    const data = this.generateData(this.periodName)
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
      },

      chart: {
        backgroundColor: 'transparent',
        with: '100%',
        height: '40%',
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
      const allTrnsIds = Object.keys(trns)

      // diff periods from oldest trn and today
      const oldestTrnDate = dayjs(trns[this.$store.getters['trns/firstCreatedTrnId']].date).endOf(periodName)
      let periodsToShow = dayjs().endOf(periodName).diff(oldestTrnDate, periodName) + 1
      periodsToShow = periodsToShow > 24 ? 24 : periodsToShow

      // get balance for first period
      const dateStart = dayjs().endOf(periodName).subtract(periodsToShow, periodName).valueOf()
      const trnsIdsBeforeDate = allTrnsIds.filter(id => trns[id].date < dateStart)
      const totalStart = this.$store.getters['trns/getTotalOfTrnsIds'](trnsIdsBeforeDate, true)

      const categories = []
      const incomesData = []
      const expensesData = []
      const totalData = []

      for (let index = 0; index < periodsToShow; index++) {
        // count balance
        const balanceDateStart = dayjs().endOf(periodName).subtract(index, periodName).valueOf()
        const balanceTrnsIds = allTrnsIds.filter(id => trns[id].date > dateStart && trns[id].date < balanceDateStart)
        const balanceTotal = this.$store.getters['trns/getTotalOfTrnsIds'](balanceTrnsIds, true)

        // count total period
        const periodDate = dayjs().endOf(periodName).subtract(index, periodName).valueOf()
        const name = dayjs(periodDate).format('MMM YY')
        const trnsIds = this.$store.getters['trns/getTrns']({ date: periodDate, periodName })
        const periodTotal = this.$store.getters['trns/getTotalOfTrnsIds'](trnsIds)

        // return
        incomesData.push({
          date: periodDate,
          y: Number(`${periodTotal.incomes.toFixed()}`)
        })
        expensesData.push({
          date: periodDate,
          y: Number(`${periodTotal.expenses.toFixed()}`)
        })
        totalData.push({
          date: periodDate,
          y: Number(`${(totalStart.total + balanceTotal.total).toFixed()}`)
        })
        categories.push(name)
      }

      return {
        series: [{
          visible: true,
          type: 'areaspline',
          name: 'Balance',
          color: '#c1c1c1',
          data: totalData
        }, {
          visible: true,
          // type: 'spline',
          name: 'Incomes',
          color: 'var(--c-incomes-1)',
          data: incomesData
        }, {
          visible: true,
          // type: 'spline',
          name: 'Expenses',
          color: 'var(--c-expenses-1)',
          data: expensesData
        }],
        categories
      }
    }
  }
}
</script>

<template lang="pug">
.chart(ref="chart")
  .chart__nav
    .chart__navItem(
      @click="changePeriod('month')"
    ) Months
    .chart__navItem(
      @click="changePeriod('year')"
    ) Years
  .chart__content
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
  background var(--c-bg-2)
  anim()

  &__nav
    z-index 10
    position absolute
    top $m6
    right 50%
    display flex
    background var(--c-bg-2)
    border 1px solid $border
    transform translateX(50%)

  &__navItem
    padding $m6 $m8

    +media-hover()
      background var(--c-bg-1)

  &__content
    padding 30px 60px

</style>
