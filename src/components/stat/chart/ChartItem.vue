<script>
import moment from 'moment'

export default {
  props: {
    period: {
      type: Object,
      required: true
    },
    maxAmountValue: {
      type: Number,
      required: true
    },
    parentClassName: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      activeChartLeftOffset: null,
      hoverChart: null
    }
  },

  computed: {
    className () {
      const filterDate = this.$store.state.filter.date
      const filterPeriod = this.$store.state.filter.period
      const currentPeriodDate = this.period.date
      return {
        _active: moment(parseInt(currentPeriodDate)).isSame(filterDate, filterPeriod),
        [`_${filterPeriod}`]: true,
        _grouped: this.$store.state.chart.periods[filterPeriod].grouped
      }
    },
    formatedPeriodName () {
      const dateValueOf = parseInt(this.period.date)
      const filterPeriod = this.$store.state.filter.period
      let formatedDate

      switch (filterPeriod) {
        case 'day':
          formatedDate = moment(dateValueOf).format('D')
          if (!this.$store.state.chart.periods[filterPeriod].grouped) {
            moment().isSame(dateValueOf, 'year')
              ? formatedDate = moment(dateValueOf).format('D.MM')
              : formatedDate = moment(dateValueOf).format('D.MM.YY')
          }
          return formatedDate

        case 'week':
          return moment(parseInt(dateValueOf)).week()

        case 'month':
          formatedDate = moment(dateValueOf).format('MMM')
          if (!this.$store.state.chart.periods[filterPeriod].grouped) {
            moment().isSame(dateValueOf, 'year')
              ? formatedDate = moment(dateValueOf).format('MMM')
              : formatedDate = moment(dateValueOf).format('MMM YY')
          }
          return formatedDate

        case 'year':
          return moment(dateValueOf).format('YYYY')
      }
    },
    periods () {
      return this.$store.state.chart.periods
    }
  },

  methods: {
    getStyle (amount) {
      return {
        height: `${Math.abs(amount) / Math.abs(this.maxAmountValue) * 100}%`
      }
    },
    handlePerioSelect () {
      this.$store.dispatch('setDate', parseInt(this.period.date))
    },
    onMouseEnterChartItem (event) {
      const filterPeriod = this.$store.state.filter.period
      const isPeriodGrouped = this.$store.state.chart.periods[filterPeriod].grouped
      const values = this.period
      const parent = document.querySelector(this.parentClassName)
      const parentScrollLeft = parent.scrollLeft
      const targetOffset = event.target.offsetLeft
      const targetWidth = event.target.clientWidth
      const parentOffset = event.target.parentNode.parentNode.offsetLeft
      let offset
      isPeriodGrouped
        ? offset = `${targetOffset + (targetWidth / 2) + parentOffset - parentScrollLeft}px`
        : offset = `${targetOffset + (targetWidth / 2) - parentScrollLeft}px`
      this.$store.commit('setHoveredPeriodValues', { values, offset })
    }
  }
}
</script>

<template lang="pug">
.chart-item(
  :class="className"
  @click="handlePerioSelect"
  @mouseenter="onMouseEnterChartItem"
  @mouseleave="$store.commit('clearHoveredPeriodValues')"
)
  .chart-item__graph
    .chart-item__graph-box(v-if="period.expenses <= 0 && period.incomes <= 0")
      .chart-item__graph-line._empty
    .chart-item__graph-box(v-if="period.incomes > 0")
      .chart-item__graph-line._incomes(:style="getStyle(period.incomes)")
    .chart-item__graph-box(v-if="period.expenses > 0")
      .chart-item__graph-line._expenses(:style="getStyle(period.expenses)")
  .chart-item__name {{ formatedPeriodName }}
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/scrollbar"

.chart-item
  padding $m5 $m5
  flex-grow 1
  border-left 1px solid var(--c-bg-1)
  border-right 1px solid transparent

  @media $media-laptop
    padding $m8 $m5

  &._week
    min-width 50px
    padding-left $m5
    padding-right $m5

  &._month
    @media $media-laptop
      min-width 70px

  &._year
    padding-left $m8
    padding-right $m8

  &._grouped
    border-color transparent
    min-width 0

  &._grouped._week
    padding-left $m6
    padding-right $m6

  &._grouped._month
    padding-left $m5
    padding-right $m5

    @media $media-laptop
      padding-left $m6
      padding-right $m6

  &:hover
    background var(--c-bg-1)
    border-color transparent

  &._active
    color var(--c-font-2)
    background var(--c-bg-3)
    border-left 1px solid var(--c-bg-1)
    border-right 1px solid transparent

   &._active._grouped
      border-right 1px solid var(--c-bg-1)

  &__name
    text-align center
    typo-small-upper(12px)
    padding-top $m5
    white-space nowrap

    @media $media-laptop
      typo-small-upper(12px)

  &__graph
    display flex
    justify-content center

    &-box
      display flex
      flex-flow column
      justify-content flex-end
      height 90px

      @media $media-laptop
        height 121px

      ^[0]._grouped &
        height calc(62px + 28px)
        padding-top 28px

        @media $media-laptop
          height calc(79px + 42px)
          padding-top 42px

    &-line
      width 6px
      margin 0 2px
      min-height 1px

      &._expenses
        background var(--c-expenses-1)

      &._incomes
        background var(--c-incomes-1)

      &._empty
        width 2px
        background grey
</style>
