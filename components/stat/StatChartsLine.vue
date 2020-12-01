<script>
export default {
  name: 'StatChartsLine2',

  computed: {
    periods () {
      return this.$store.state.chart.periods
    },
    filterPeriod () {
      return this.$store.state.filter.period
    },
    activePeriodNumber () {
      const statFromDate = this.$day().startOf(this.$store.state.filter.period)
      return statFromDate.diff(this.$store.state.filter.date, this.$store.state.filter.period) + 1
    },
    periodsValues () {
      const trns = this.$store.state.trns.items
      const transferCategoryId = this.$store.getters['categories/transferCategoryId']
      const trnsIds = this.$store.getters['trns/selectedTrnsIds']
      const filterPeriod = this.$store.state.filter.period
      const diff = this.getNumberShowedPeriods()

      const values = {}
      for (let period = 0; period < diff; period++) {
        const periodStartDate = this.$day().subtract(period, filterPeriod).startOf(filterPeriod)
        const periodEndDate = this.$day().subtract(period, filterPeriod).endOf(filterPeriod)
        const ids = trnsIds
          .filter((trnId) => {
            return trns[trnId].date >= periodStartDate &&
              trns[trnId].date <= periodEndDate &&
              trns[trnId].categoryId !== transferCategoryId
          })

        values[periodStartDate.valueOf()] = {
          date: periodStartDate.valueOf(),
          ...this.$store.getters['trns/getTotalOfTrnsIds'](ids)
        }
      }

      return values
    },
    periodsGroupedValues () {
      const filterPeriod = this.$store.state.filter.period
      const periodsValues = this.periodsValues
      const groupedBy = this.periods[filterPeriod].groupedBy
      const groupedValues = {}

      for (const date in periodsValues) {
        const periodStartDateValue = this.$day(parseInt(date)).startOf(groupedBy).valueOf()
        const periodEndDateValue = this.$day(parseInt(date)).endOf(groupedBy).valueOf()

        if (date >= periodStartDateValue && date <= periodEndDateValue) {
          groupedValues[periodStartDateValue]
            ? groupedValues[periodStartDateValue].push({ date, ...periodsValues[date] })
            : groupedValues[periodStartDateValue] = [{ date, ...periodsValues[date] }]
        }
      }

      return groupedValues
    },
    maxAmountValue () {
      const periodsValues = this.periodsValues
      let biggest = 0

      for (const date in periodsValues) {
        const incomes = periodsValues[date].incomes
        const expenses = periodsValues[date].expenses
        if (incomes > biggest) { biggest = incomes }
        if (expenses > biggest) { biggest = expenses }
      }
      return biggest
    }
  },

  created () {
    this.defaultPeriods = this.$store.state.chart.periods
  },

  methods: {
    getNumberShowedPeriods () {
      const filterPeriod = this.$store.state.filter.period
      let diff = 0

      if (this.periods[filterPeriod].grouped) {
        diff = this.getGroupedPeriods()
      }
      else {
        this.activePeriodNumber > this.periods[filterPeriod].showedPeriods
          ? diff = this.activePeriodNumber
          : diff = this.periods[filterPeriod].showedPeriods
      }
      if (diff <= 0) { diff = 1 }
      this.$store.dispatch('stat/setDiffPeriods', diff)

      return diff
    },

    getGroupedPeriods () {
      const filterPeriod = this.filterPeriod
      const groupedBy = this.periods[filterPeriod].groupedBy
      const showedGroups = this.periods[filterPeriod].showedGroups
      let numberOfPeriods = 0

      // periods in current group
      const getPeriodsInCurrentGroup = () => {
        let currentGroupPeriods
        if (filterPeriod === 'day') { currentGroupPeriods = parseInt(this.$day().format('D')) }
        if (filterPeriod === 'week') { currentGroupPeriods = this.$day().week() - this.$day().startOf('month').week() + 1 }
        if (filterPeriod === 'month') { currentGroupPeriods = parseInt(this.$day().format('MM')) }
        return currentGroupPeriods
      }

      // periods in prev group
      const getPeriodsInPrevGroup = () => {
        let prevGroupsPeriods = 0
        for (let index = 1; index < showedGroups; index++) {
          prevGroupsPeriods = prevGroupsPeriods + getPeriodsInPrevGroup2(index)
        }
        return prevGroupsPeriods
      }

      const getPeriodsInPrevGroup2 = (hey) => {
        const groupDateStart = this.$day().subtract(hey, groupedBy).startOf(groupedBy)
        const groupDateEnd = this.$day().subtract(hey, groupedBy).endOf(groupedBy)

        let periodsInGroup = 0
        filterPeriod === 'week'
          ? periodsInGroup = groupDateEnd.week() - groupDateStart.week()
          : periodsInGroup = groupDateEnd.diff(groupDateStart, filterPeriod) + 1

        return periodsInGroup
      }

      const periodsInCurrentGroup = getPeriodsInCurrentGroup()

      showedGroups === 1
        ? numberOfPeriods = periodsInCurrentGroup
        : numberOfPeriods = periodsInCurrentGroup + getPeriodsInPrevGroup()

      // when view old data
      if (this.activePeriodNumber >= numberOfPeriods) {
        numberOfPeriods = periodsInCurrentGroup
        let index = 1
        while (this.activePeriodNumber >= numberOfPeriods) {
          numberOfPeriods = numberOfPeriods + getPeriodsInPrevGroup2(index)
          index++
        }
      }

      return numberOfPeriods
    },

    formatGroupName (date, groupedBy) {
      const dateValueOf = parseInt(date)
      let format
      switch (groupedBy) {
        case 'month':
          format = 'MMMM'
          break
        case 'year':
          format = 'YYYY'
          break
      }
      return this.$day(dateValueOf).format(format)
    }
  }
}
</script>

<template lang="pug">
.charts.swiper-no-swiping
  template(v-if="$store.state.filter.period === 'all'")
    .charts__allData Change period to see chart

  template(v-if="$store.state.filter.period !== 'all'")
    .charts__content
      //- grouped
      template(v-if="periods[filterPeriod].grouped")
        .charts__items._grouped
          template(v-for="(periodGroups, groupDate) in periodsGroupedValues")
            .chart-group(:class="{ _grouped: periods[filterPeriod].grouped }")
              .chart-group__name(v-show="periods[filterPeriod].grouped")
                template(v-if="periods[filterPeriod].grouped") {{ formatGroupName(groupDate, periods[filterPeriod].groupedBy) }}

              .chart-group__content
                template(v-for="period in periodGroups")
                  ChartItem(
                    :key="period.date"
                    :maxAmountValue="maxAmountValue"
                    :period="period"
                    parentClassName=".charts__items")

      //- simple
      template(v-else)
        .charts__items
          template(v-for="period in periodsValues")
            ChartItem(
              :key="period.date"
              :maxAmountValue="maxAmountValue"
              :period="period"
              parentClassName=".charts__items")

      //- popup
      template(v-if="$store.state.ui.pc && $store.state.chart.hoveredPeriod.values")
        ChartPopup
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.charts
  z-index 5
  position relative

  +media-tablet()
    padding $m6

  &__allData
    opacity .7
    display flex
    align-items center
    justify-content center
    font-size 14px

  &__items
    overflow hidden
    overflow-x auto
    display flex
    flex-direction row-reverse
    scrollbar()

    &._grouped
      padding 0 $m4

  &__nav
    z-index 2
    position absolute
    right $m7
    bottom $m7

.chart-group
  position relative
  flex-grow 1
  margin-left 20px
  padding-left 20px
  border-left 1px solid var(--c-bg-4)

  &:last-child
    margin-left 0
    padding-left 0
    border 0

  &__name
    opacity .7
    position absolute
    right 0
    width 100%
    height 42px
    padding-top 0
    padding-bottom $m4
    font-secondary()
    font-size 14px
    text-align center
    text-transform uppercase
    white-space nowrap
    letter-spacing .5px

  &__content
    display flex
    flex-direction row-reverse
    padding-top 20px

.chart-space
  &:last-child
    min-width 40px
</style>
