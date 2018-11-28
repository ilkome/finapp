<script>
import moment from 'moment'

import Amount from '@/components/amount/Amount'
import ChartItem from '@/components/stat/chart/ChartItem'
import ChartMenu from '@/components/stat/chart/ChartMenu'
import ChartPopup from '@/components/stat/chart/ChartPopup'

export default {
  components: {
    Amount,
    ChartItem,
    ChartMenu,
    ChartPopup
  },

  computed: {
    periods () {
      return this.$store.state.chart.periods
    },
    filterPeriod () {
      return this.$store.state.filter.period
    },
    activePeriodNumber () {
      const statFromDate = moment().startOf(this.$store.state.filter.period)
      return statFromDate.diff(this.$store.state.filter.date, this.$store.state.filter.period) + 1
    },
    periodsValues () {
      const trns = this.$store.state.trns.items
      const transferCategoryId = this.$store.getters.transferCategoryId
      let trnsIds = this.$store.getters.selectedTrnsIds
      const filterPeriod = this.$store.state.filter.period
      const diff = this.getNumberShowedPeriods()

      const values = {}
      for (let period = 0; period < diff; period++) {
        let periodStartDate = moment().subtract(period, filterPeriod).startOf(filterPeriod)
        let periodEndDate = moment().subtract(period, filterPeriod).endOf(filterPeriod)
        const ids = trnsIds
          .filter(trnId => {
            return trns[trnId].date >= periodStartDate &&
              trns[trnId].date <= periodEndDate &&
              trns[trnId].categoryId !== transferCategoryId
          })

        values[periodStartDate.valueOf()] = {
          date: periodStartDate.valueOf(),
          ...this.$store.getters.getTotalOfTrnsIds(ids)
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
        let periodStartDateValue = moment(parseInt(date)).startOf(groupedBy).valueOf()
        let periodEndDateValue = moment(parseInt(date)).endOf(groupedBy).valueOf()

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
        if (incomes > biggest) biggest = incomes
        if (expenses > biggest) biggest = expenses
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
      } else {
        this.activePeriodNumber > this.periods[filterPeriod].showedPeriods
          ? diff = this.activePeriodNumber
          : diff = this.periods[filterPeriod].showedPeriods
      }
      if (diff <= 0) diff = 1
      this.$store.commit('setDiffPeriods', diff)

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
        if (filterPeriod === 'day') currentGroupPeriods = parseInt(moment().format('D'))
        if (filterPeriod === 'week') currentGroupPeriods = moment().week() - moment().startOf('month').week() + 1
        if (filterPeriod === 'month') currentGroupPeriods = parseInt(moment().format('MM'))
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
        const groupDateStart = moment().subtract(hey, groupedBy).startOf(groupedBy)
        const groupDateEnd = moment().subtract(hey, groupedBy).endOf(groupedBy)

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
      return moment(dateValueOf).format(format)
    }
  }
}
</script>

<template lang="pug">
.charts(v-if="$store.state.ui.statGraphsVisible && $store.state.filter.period !== 'all'")
  .charts__nav
    ChartMenu

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
                  parentClassName=".charts__items"
                )
        .chart-space

    //- simple
    template(v-else)
      .charts__items
        template(v-for="period in periodsValues")
          ChartItem(
            :key="period.date"
            :maxAmountValue="maxAmountValue"
            :period="period"
            parentClassName=".charts__items"
          )

    //- popup
    template(v-if="$store.state.ui.pc && $store.state.chart.hoveredPeriod.values")
      ChartPopup(v-if="")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/animations"
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/scrollbar"

.charts
  z-index 2
  position relative
  background var(--c-bg-2)
  border-bottom 1px solid var(--c-bg-1)

  @media $media-laptop
    min-height 160px

  &__items
    scrollbar()
    overflow-x auto
    display flex
    margin-bottom -1px

    @media $media-laptop
      padding 0 $mb2

    &._grouped
      padding 0 $m7

      @media $media-laptop
        padding 0 $mb2

  &__nav
    z-index 2
    position absolute
    right $m7
    bottom $m7

    @media $media-laptop
      right $mb2

.chart-group
  position relative
  flex-grow 0
  margin-right $m8
  padding-right $m8

  &:last-child
    margin-right 0
    border 0

  &__name
    position absolute
    width 100%
    text-align center
    height 42px
    padding-top $m7
    padding-bottom $m4
    font-size 14px
    font-secondary()
    text-transform uppercase
    white-space nowrap
    letter-spacing .5px
    opacity .7

    @media $media-laptop
      padding-top $m8
      font-size 18px

  &__content
    display flex

.chart-space
  @media $media-laptop
    min-width $m10
</style>
