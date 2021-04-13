<script>
import currency from 'currency.js'
import { Chart } from 'highcharts-vue'
import chartOptions from '~/components/stat/chartOptions'

const baseAmountFormat = (value, separator, precision) => currency(value, { symbol: null, precision, pattern: '#', separator }).format()

export default {
  name: 'AnalyticsChart',

  components: {
    Chart
  },

  props: {
    categoryId: {
      type: String,
      required: true
    },

    chartType: {
      type: String,
      default: 'column'
    }
  },

  data () {
    return {
      average: 0,
      total: 0,
      date: this.$day().valueOf(),
      visiblePeriodMenu: false,
      dateStart: null,
      dateEnd: null
    }
  },

  computed: {
    activeTab () {
      return this.$store.state.dashboard.activeTab === 'balance'
    },

    showedPeriods () {
      return this.$store.state.stat.showedPeriods
    },

    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
    },

    filterDate () {
      return this.$store.state.filter.date
    },

    periodName () {
      return this.$store.state.filter.period
    },

    chartData () {
      const vm = this
      const trns = this.$store.state.trns.items
      const periodName = this.periodName

      // diff periods from oldest trn and today
      const oldestTrnDate = this.$day(trns[this.$store.getters['trns/firstCreatedTrnId']].date).endOf(periodName)
      let periodsToShow = this.$day().endOf(periodName).diff(oldestTrnDate, periodName) + 1
      periodsToShow = periodsToShow > this.showedPeriods ? this.showedPeriods : periodsToShow

      const categories = []
      const categoryData = []

      let format = 'MMM'
      if (periodName === 'day') { format = 'D.MM' }
      if (periodName === 'week') { format = 'D.MM' }
      if (periodName === 'month') { format = 'MMMM' }
      if (periodName === 'year') { format = 'YYYY' }

      for (let index = 0; index < periodsToShow; index++) {
        // count total period
        const periodDate = this.$day().endOf(periodName).subtract(index, periodName).valueOf()
        const name = this.$day(periodDate).format(format)
        const trnsIds = this.$store.getters['trns/getTrns']({
          categoryId: this.categoryId,
          date: periodDate,
          periodName
        })
        const periodTotal = this.$store.getters['trns/getTotalOfTrnsIds'](trnsIds)

        // return
        categoryData.unshift({
          date: periodDate,
          y: Math.abs(Number(`${periodTotal.incomes.toFixed() - periodTotal.expenses.toFixed()}`)),
          color: 'var(--c-font-1)',
          marker: {
            radius: 6,
            enabled: this.$day(periodDate).isSame(this.$store.state.filter.date, periodName)
          }
        })
        categories.unshift(name)
      }

      let periods = 0
      let periodsTotal = 0
      for (const iterator of categoryData) {
        if (iterator.y !== 0) {
          periods = periods + 1
          periodsTotal = periodsTotal + iterator.y
        }
      }

      this.average = Math.abs(Number(periodsTotal / periods).toFixed())
      this.total = categoryData[categoryData.length - 1].y

      const data = {
        series: [{
          visible: true,
          type: this.chartType,
          data: categoryData
        }],
        categories
      }

      return {
        ...chartOptions,
        legend: false,
        tooltip: {
          shared: true,
          animation: false,
          outside: true,
          positioner () {
            return { x: -1000, y: -1000 }
          }
        },

        series: data.series,

        xAxis: {
          ...chartOptions.xAxis,
          categories: data.categories
        },

        yAxis: {
          ...chartOptions.yAxis,
          plotLines: [{
            color: 'var(--c-font-5)',
            value: this.average, // Insert your average here
            width: '2',
            height: 160,
            zIndex: 1
          }]
        },

        chart: {
          ...chartOptions.chart,
          height: '120',

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
              enabled: true
            },
            cursor: 'pointer',
            point: {
              events: {
                click () {
                  vm.$store.dispatch('filter/setDate', parseInt(this.date))
                }
              }
            },
            allowPointSelect: true,
            states: {
              select: {
                color: 'green',
                backgroundColor: 'var(--c-bg-15)'
              }
            }
          }
        }
      }
    }
  },

  methods: {
    formatAmount (amount) {
      const fixed = this.$store.state.currencies.base === 'RUB' ? 0 : 2
      return baseAmountFormat(amount, ' ', fixed)
    }
  }
}
</script>

<template lang="pug">
.chart(ref="chart")
  .columns
    .item
      .item__name {{ $t('stat.selectedPeriod') }}
      .item__price
        Amount(
          :currency="$store.state.currencies.base"
          :type="3"
          :value="total || 0"
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

  Chart.swiper-no-swiping(:options="chartData")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.chart
  z-index 3
  position relative
  padding 20px

.item
  color var(--c-font-4)
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
