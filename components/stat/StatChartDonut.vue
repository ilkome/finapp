<script>
import dayjs from 'dayjs'
import { Chart } from 'highcharts-vue'
import chartOptions from './chartOptions'

export default {
  components: {
    Chart
  },

  data () {
    return {
      date: dayjs().valueOf(),
      periodName: 'month',
      visiblePeriodMenu: false,
      dateStart: null,
      dateEnd: null,
      chartOptions
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
        categories: data.categories,

        clickOnCrosshair (e, p) {
          console.log(this, e, p)
        }
      },

      chart: {
        events: {
          click (e) {
            console.log('kci')
            // alert(this.series[0].searchPoint(e, true).category)
          }
        }
      },
      events: {
        click (e) {
          console.log('kci')
          // alert(this.series[0].searchPoint(e, true).category)
        }
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
          type: 'spline',
          name: 'Incomes',
          color: 'var(--c-incomes-1)',
          data: incomesData
        }, {
          visible: true,
          type: 'spline',
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
    .summary(
      v-if="chartOptions.series[0] && chartOptions.series[0].data"
    )
      .summaryBlock(
        v-for="(data, dataIdx) in chartOptions.series[0].data"
      )
        h2 {{ $day(data.date).format('MMMM YYYY') }}
        .summary__wrap
          .summary__item._incomes
            .summary__row
              .summary__title {{ $lang.money.incomes }}
              .summary__amount
                Amount(
                  :big="true"
                  :currency="$store.state.currencies.base"
                  :value="chartOptions.series[1].data[dataIdx].y"
                )

            .summary__row(
              v-if="chartOptions.series[1].data[dataIdx + 1]"
            )
              .summary__average
                .summary__average__icon: .mdi.mdi-chart-timeline
                .summary__average__title Difference
              .summary__amount._average
                Amount(
                  :big="true"
                  :currency="$store.state.currencies.base"
                  :type="chartOptions.series[1].data[dataIdx].y - chartOptions.series[1].data[dataIdx + 1].y < 0 ? 0 : 3"
                  :value="chartOptions.series[1].data[dataIdx].y - chartOptions.series[1].data[dataIdx + 1].y"
                )

          .summary__item._total
            .summary__row
              .summary__title Balance
              .summary__amount
                Amount(
                  :big="true"
                  :currency="$store.state.currencies.base"
                  :value="chartOptions.series[0].data[dataIdx].y"
                )

            .summary__row(
              v-if="chartOptions.series[0].data[dataIdx + 1]"
            )
              .summary__average
                .summary__average__icon: .mdi.mdi-chart-timeline
                .summary__average__title Difference
              .summary__amount._average
                Amount(
                  :big="true"
                  :currency="$store.state.currencies.base"
                  :type="chartOptions.series[0].data[dataIdx].y - chartOptions.series[0].data[dataIdx + 1].y < 0 ? 0 : 1"
                  :value="chartOptions.series[0].data[dataIdx].y - chartOptions.series[0].data[dataIdx + 1].y"
                )

          .summary__item._expenses
            .summary__row
              .summary__title {{ $lang.money.expenses }}
              .summary__amount
                Amount(
                  :big="true"
                  :currency="$store.state.currencies.base"
                  :value="chartOptions.series[2].data[dataIdx].y"
                )

            .summary__row(
              v-if="chartOptions.series[2].data[dataIdx + 2]"
            )
              .summary__average
                .summary__average__icon: .mdi.mdi-chart-timeline
                .summary__average__title Difference
              .summary__amount._average
                Amount(
                  :big="true"
                  :currency="$store.state.currencies.base"
                  :type="chartOptions.series[2].data[dataIdx].y - chartOptions.series[2].data[dataIdx + 1].y < 0 ? 0 : 3"
                  :value="chartOptions.series[2].data[dataIdx].y - chartOptions.series[2].data[dataIdx + 1].y"
                )


        //- .chartLine
        //-   .chartLine__date {{  }}
        //-   .chartLine__info
        //-     .chartLine__amount

        //-     .chartLine__amount
        //-       Amount(
        //-         :currency="$store.state.currencies.base"
        //-         :type="0"
        //-         :value="chartOptions.series[2].data[dataIdx].y"
        //-       )
        //-     .chartLine__amount
        //-       Amount(
        //-         :currency="$store.state.currencies.base"
        //-         :value="data.y"
        //-       )

        //-     .chartLine__amount
        //-       Amount(
        //-         v-if="chartOptions.series[0].data[dataIdx + 1]"
        //-         :currency="$store.state.currencies.base"
        //-         size="lg"
        //-         :value="chartOptions.series[0].data[dataIdx].y - chartOptions.series[0].data[dataIdx + 1].y"
        //-         :type="chartOptions.series[0].data[dataIdx].y - chartOptions.series[0].data[dataIdx + 1].y > 0 ? 1 : 0"
        //-       )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/media"

$background = var(--c-bg-4)
$border = var(--c-bg-1)

.summaryBlock
  margin-bottom $m8
  padding 20px 20px
  background var(--c-bg-3)
  border-top 1px solid var(--c-bg-2)
  border-bottom 1px solid var(--c-bg-2)
  border-radius $m6

  h2
    padding-bottom $m7

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

  &._modal
    z-index 5
    position fixed
    left 0
    top 0
    width 100%
    height 100%

.summary
  overflow hidden

  &__wrap
    display flex
    flex-flow row
    justify-content space-between
    max-width 1100px

  &__item
    flex-grow 0
    display flex
    flex-flow column
    justify-content center
    margin $m5 $m7
    padding $m3 $m9
    padding-right 0

    @media $media-phone
      border-bottom 1px solid var(--c-bg-5)

    @media $media-laptop
      flex 0 1 250px
      padding 0
      margin 0

    @media $media-pc
      padding $m3 $m9
      padding-right 0

    &._expenses
      @media $media-pc
        border-left 2px solid rgba(200, 30, 50, .5)
    &._total
      align-self center
      @media $media-pc
        border-left 2px solid var(--c-bg-7)

    &._incomes
      align-self end
      @media $media-pc
        border-left 2px solid rgba(44, 173, 34, .8)

  &__row
    flex-grow 0
    display flex
    align-items center
    justify-content space-between
    padding-bottom $m6
    &:last-child
      padding-bottom 0

  &__title
    font-header-4()
    color var(--c-font-3)
    padding-right $m8
    &._incomes
      color var(--c-incomes-1)
    &._expenses
      color var(--c-expenses-1)

  &__amount
    &._average
      opacity .7
      .amount
        font-size 15px

  &__average
    display flex
    opacity .7

    &__icon
      font-size 15px
      margin-right $m5

    &__title
      font-header-4()
      font-size 16px
      padding-right $m8
</style>
