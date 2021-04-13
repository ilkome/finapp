<script>
import currency from 'currency.js'
import { Chart } from 'highcharts-vue'
import chartOptions from '~/components/stat/chartOptions'

const baseAmountFormat = (value, separator, precision) => currency(value, { symbol: null, precision, pattern: '#', separator }).format()

export default {
  name: 'AnalyticsChartTrns',

  components: {
    Chart
  },

  props: {
    periodName: {
      type: String,
      default: 'month'
    },

    isShowSummury: {
      type: Boolean,
      default: true
    }
  },

  data () {
    return {
      biggest: 0,
      average: 0,
      date: this.$day().valueOf(),
      visiblePeriodMenu: false,
      dateStart: null,
      dateEnd: null,
      chartOptions: {
        ...chartOptions,
        legend: false,
        tooltip: false
      }
    }
  },

  computed: {
    activeTab () {
      return this.$store.state.dashboard.activeTab === 'balance'
    },

    periods () {
      return this.$store.state.chart.periods
    },

    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
    },

    statAverage () {
      return this.$store.getters['stat/statAverage']
    },

    filterDate () {
      return this.$store.state.filter.date
    },

    filterCategory () {
      return this.$store.state.filter.categoryId
    },
    filterWallet () {
      return this.$store.state.filter.walletId
    }
  },

  watch: {
    showedPeriods () {
      this.init()
    },

    filterDate () {
      this.init()
    },
    filterCategory () {
      this.init()
    },
    filterWallet () {
      this.init()
    },
    periods () {
      this.init()
    }
  },

  mounted () {
    this.init()
  },

  methods: {
    init () {
      const data = this.generateData(this.periodName)
      const handlePerioSelect = (date) => {
        this.$store.dispatch('filter/setPeriod', this.periodName)
        this.$store.dispatch('filter/setDate', date)
      }

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
        tooltip: false,
        xAxis: {
          categories: data.categories
        },

        yAxis: {
          plotLines: [{
            color: 'var(--c-bg-8)',
            value: this.average, // Insert your average here
            width: '2',
            zIndex: 1
          }]
        },

        chart: {
          backgroundColor: 'transparent',
          with: '100%',
          height: 160,
          spacing: [5, 0, 0, 0],
          type: 'column',
          panning: true,
          panKey: 'shift',

          events: {
            click (e) {
              // console.log(this.series[0].searchPoint(e, true))
            }
          }
        }
      }
    },

    formatAmount (amount) {
      const fixed = this.$store.state.currencies.base === 'RUB' ? 0 : 2
      return baseAmountFormat(amount, ' ', fixed)
    },

    generateData (periodName, oldSeries) {
      const categories = []
      const incomesData = []

      let format = 'MM'
      if (periodName === 'day') { format = 'D.MM' }
      if (periodName === 'week') { format = 'D.MM' }
      if (periodName === 'month') { format = 'MMM' }
      if (periodName === 'year') { format = 'YYYY' }

      for (let index = 0; index < this.$store.state.chart.periods[periodName].showedPeriods; index++) {
        // count total period
        const periodDate = this.$day().endOf(periodName).subtract(index, periodName).valueOf()
        const name = this.$day(periodDate).startOf(periodName).format(format)
        const trnsIds = this.$store.getters['trns/getTrns']({
          date: periodDate,
          periodName
        })
        const periodTotal = this.$store.getters['trns/getTotalOfTrnsIds'](trnsIds)

        let amount = Math.floor(Number(`${periodTotal.incomes.toFixed() - periodTotal.expenses.toFixed()}`))
        if (!this.statAverage.total) {
          amount = Math.abs(Number(`${periodTotal.incomes.toFixed() - periodTotal.expenses.toFixed()}`))
        }

        // return
        incomesData.unshift({
          date: periodDate,
          y: amount,
          color: 'var(--c-font-1)',
          // marker: {
          //   radius: 6,
          //   color: this.$day(periodDate).isSame(this.$store.state.filter.date, periodName)
          // }
        })
        categories.unshift(name)
      }

      let biggest = 0

      let periods = 0
      let periodsTotal = 0
      for (const iterator of incomesData) {
        if (iterator.y !== 0) {
          periods = periods + 1
          periodsTotal = periodsTotal + iterator.y
          if (iterator.y > biggest) {
            biggest = iterator.y
          }
        }
      }

      this.biggest = biggest

      let amountAverage = Math.floor(Number(periodsTotal / periods).toFixed())
      if (this.statAverage.total !== 0) {
        amountAverage = Math.abs(Number(periodsTotal / periods).toFixed())
      }
      this.average = amountAverage

      let color = 'var(--c-blue-1)'

      if (this.statAverage.total === 0) {
        if (this.statAverage.incomes > 0) {
          color = 'var(--c-incomes-1)'
        }
        else if (this.statAverage.expenses > 0) {
          color = 'var(--c-expenses-1)'
        }
      }

      return {
        series: [{
          visible: true,
          type: 'spline',
          name: 'Data',
          color,
          data: incomesData,
          marker: {
            fillColor: 'var(--c-bg-4)',
            lineWidth: 2,
            lineColor: 'var(--c-blue-1)',
            symbol: 'circle'
          }
        }],
        categories
      }
    }
  }
}
</script>

<template lang="pug">
.chart(ref="chart" :class="{ _height: isShowSummury }")
  .columns(v-if="isShowSummury")
    .item
      .item__name {{ $t('stat.selectedPeriod') }}
      .item__price
        Amount(
          v-if="chartOptions.series[0] && chartOptions.series[0].data.length"
          :currency="$store.state.currencies.base"
          :type="3"
          :value="chartOptions.series[0].data[chartOptions.series[0].data.length - 1].y"
          size="xl"
          vertical="center"
        )

    .item
      .item__name {{ $t('money.average.base') }}
      .item__price
        Amount(
          :currency="$store.state.currencies.base"
          :value="average || 0"
          size="xl"
          vertical="center"
        )

  Chart.swiper-no-swiping(:options="chartOptions")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.chart
  z-index 3
  position relative
  height 166px
  padding $m5 0 0 0

  &._height
    height 236px

.item
  color var(--c-font-4)
  font-size 12px
  text-align center

  &__name
    padding-bottom $m5

.columns
  display grid
  grid-template-columns repeat(2, 1fr)
  grid-column-gap $m7
  grid-row-gap $m7
  padding-bottom $m7
</style>
