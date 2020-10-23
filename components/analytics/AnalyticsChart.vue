<script>
import dayjs from 'dayjs'
import { Chart } from 'highcharts-vue'
import Highcharts from 'highcharts'
import borderRadius from 'highcharts-border-radius'
import chartOptions from '~/components/stat/chartOptions'

borderRadius(Highcharts)

export default {
  name: 'AnalyticsChart',

  components: {
    Chart
  },

  props: {
    categoryId: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      average: 0,
      date: dayjs().valueOf(),
      periodName: 'month',
      visiblePeriodMenu: false,
      dateStart: null,
      dateEnd: null,
      chartOptions: {
        ...chartOptions,
        legend: false
      }
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
    }
  },

  watch: {
    showedPeriods (newValue) {
      this.init()
    },

    filterDate (newValue) {
      this.init()
    }
  },

  mounted () {
    this.init()
  },

  methods: {
    init () {
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

        yAxis: {
          plotLines: [{
            color: 'var(--c-font-5)',
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
          zoomType: 'x',
          panning: true,
          panKey: 'shift'
        }
      }
    },

    formatAmount (amount) {
      const fixed = this.$store.state.currencies.base === 'RUB' ? 0 : 2
      return Number(`${amount.toFixed(fixed)}`).toLocaleString('ru-RU')
    },

    generateData (periodName, oldSeries) {
      const trns = this.$store.state.trns.items

      // diff periods from oldest trn and today
      const oldestTrnDate = dayjs(trns[this.$store.getters['trns/firstCreatedTrnId']].date).endOf(periodName)
      let periodsToShow = dayjs().endOf(periodName).diff(oldestTrnDate, periodName) + 1
      periodsToShow = periodsToShow > this.showedPeriods ? this.showedPeriods : periodsToShow

      const categories = []
      const incomesData = []

      for (let index = 0; index < periodsToShow; index++) {
        // count total period
        const periodDate = dayjs().endOf(periodName).subtract(index, periodName).valueOf()
        const name = dayjs(periodDate).format('MMM')
        const trnsIds = this.$store.getters['trns/getTrns']({
          categoryId: this.categoryId,
          date: periodDate,
          periodName
        })
        const periodTotal = this.$store.getters['trns/getTotalOfTrnsIds'](trnsIds)

        // return
        incomesData.unshift({
          date: periodDate,
          y: Math.abs(Number(`${periodTotal.incomes.toFixed() - periodTotal.expenses.toFixed()}`)),
          color: 'var(--c-font-1)',
          marker: {
            radius: 6,
            enabled: dayjs(periodDate).isSame(this.$store.state.filter.date, periodName)
          }
        })
        categories.unshift(name)
      }

      let periods = 0
      let periodsTotal = 0
      for (const iterator of incomesData) {
        if (iterator.y !== 0) {
          periods = periods + 1
          periodsTotal = periodsTotal + iterator.y
        }
      }

      this.average = Math.abs(Number(periodsTotal / periods).toFixed())

      return {
        series: [{
          visible: true,
          type: 'spline',
          name: 'Data',
          color: '#c1c1c1',
          data: incomesData
        }],
        categories
      }
    }
  }
}
</script>

<template lang="pug">
.chart(ref="chart")
  .columns
    .item
      .item__name Выбранный период
      .item__price
        Amount(
          :currency="$store.state.currencies.base"
          :type="3"
          :value="statCurrentPeriod.categories[categoryId].total"
          size="xl"
          vertical="center"
        )

    .item
      .item__name Среднее
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
@import "~assets/stylus/variables"

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
