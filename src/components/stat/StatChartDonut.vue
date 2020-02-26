<script>
import moment from 'moment'
import { Chart } from 'highcharts-vue'
import ContextMenu from '@/components/shared/contextMenu/ContextMenu'
import ContextMenuItem from '@/components/shared/contextMenu/ContextMenuItem'
import Dropdown from '@/components/shared/dropdown/Dropdown'
import chartOptions from './chartOptions'

export default {
  components: {
    Chart,
    ContextMenu,
    ContextMenuItem,
    Dropdown
  },

  data () {
    return {
      date: moment().valueOf(),
      periodName: 'month',
      visiblePeriodMenu: false,
      dateStart: null,
      dateEnd: null,
      chartOptions
    }
  },

  mounted () {
    const data = this.generateData(this.periodName)
    const handlePerioSelect = (date) => this.handlePerioSelect(date)
    this.chartOptions.series = data.series
    this.chartOptions.xAxis.categories = data.categories
    this.chartOptions.plotOptions.series = {
      cursor: 'pointer',
      point: {
        events: {
          click: function () {
            handlePerioSelect(this.date)
          }
        }
      }
    }
  },

  methods: {
    toogleModal () {
      this.$refs.chart.classList.add('_modal')
      this.$nextTick(() => {
        this.chartOptions.chart.redraw()
      })
    },

    handlePerioSelect (date) {
      this.$store.dispatch('setDate', parseInt(date))
    },

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
      const oldestTrnDate = moment(trns[this.$store.getters.firstCreatedTrnId].date).endOf(periodName)
      const periodsToShow = moment().endOf(periodName).diff(oldestTrnDate, periodName) + 1
      // periodsToShow = 12

      // get balance for first period
      const dateStart = moment().endOf(periodName).subtract(periodsToShow, periodName).valueOf()
      const trnsIdsBeforeDate = allTrnsIds.filter(id => trns[id].date < dateStart)
      const totalStart = this.$store.getters.getTotalOfTrnsIds(trnsIdsBeforeDate, true)

      const categories = []
      const incomesData = []
      const expensesData = []
      const totalData = []

      for (let index = 0; index < periodsToShow; index++) {
        // count balance
        const balanceDateStart = moment().endOf(periodName).subtract(index, periodName).valueOf()
        const balanceTrnsIds = allTrnsIds.filter(id => trns[id].date > dateStart && trns[id].date < balanceDateStart)
        const balanceTotal = this.$store.getters.getTotalOfTrnsIds(balanceTrnsIds, true)

        // count total period
        const periodDate = moment().endOf(periodName).subtract(index, periodName).valueOf()
        const name = moment(periodDate).format('MMM Y')
        const trnsIds = this.$store.getters.getTrns({ date: periodDate, periodName })
        const periodTotal = this.$store.getters.getTotalOfTrnsIds(trnsIds)

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
    .chart__wrap
      ContextMenu(
        :position="{ left: '-12px', top: true }"
        :visible="visiblePeriodMenu"
        v-on:onClickOpener="visiblePeriodMenu = !visiblePeriodMenu")
        template(slot="opener")
          Dropdown._noBd(
            :active="visiblePeriodMenu")
            template(slot="title") Period

        template(slot="content")
          ContextMenuItem(
            icon="mdi mdi-calendar"
            title="Month"
            v-on:onClick="changePeriod('month')"
            v-on:onClose="visiblePeriodMenu = !visiblePeriodMenu")

          ContextMenuItem(
            icon="mdi mdi-calendar-star"
            title="Year"
            v-on:onClick="changePeriod('year')"
            v-on:onClose="visiblePeriodMenu = !visiblePeriodMenu")

      //- .div(@click="toogleModal") Modal

  .chart__content
    Chart(:options="chartOptions")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/animations"

$background = var(--c-bg-4)
$border = var(--c-bg-1)

.chart
  z-index 3
  position relative
  background var(--c-bg-2)
  anim()

  &__nav
    display flex
    background $background
    border 1px solid $border

  &__wrap
    max-width 1100px
    padding 5px 60px

  &__content
    padding 30px 60px

  &._modal
    z-index 5
    position fixed
    left 0
    top 0
    width 100%
    height 100%
</style>
