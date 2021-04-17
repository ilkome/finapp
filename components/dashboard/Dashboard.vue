<script>
export default {
  data () {
    return {
      visiblePeriodMenu: false
    }
  },

  computed: {
    isEmptyData () {
      const statCurrentPeriod = this.$store.getters['stat/statCurrentPeriod']
      if (statCurrentPeriod.incomes.categoriesIds.length === 0 &&
          statCurrentPeriod.expenses.categoriesIds.length === 0 &&
          this.$store.getters['trns/selectedTrnsIdsWithDate'].length === 0) {
        return true
      }
      return false
    },

    periods () {
      return this.$store.state.chart.periods
    },

    filterPeriod () {
      return this.$store.state.filter.period
    }
  }
}
</script>

<template lang="pug">
.dashboard(v-show="$store.state.ui.activeTab === 'stat'")
  .dashboard__wrap(v-if="$store.getters['trns/hasTrns'] && $store.state.ui.statGraphsVisibility === 'visible'")
    .dashboard__chart
      StatChartLines(
        v-if="$store.getters['trns/hasTrns'] && filterPeriod !== 'all'"
        :chartType="periods[filterPeriod].grouped ? 'column' : 'line'"
      )

  .chartBlock
    DashboardNav
    StatSummaryPc
    DashboardFilter
    DashboardStatControl

  LazyStatNoStatActions(v-if="!$store.getters['trns/hasTrns']")

  .dashboard__content(v-if="$store.getters['trns/hasTrns']")
    //- empty
    //------------------------------------------------
    template(v-if="isEmptyData")
      transition(name="animation-tab")
        .dashboard__wrap
          .dashboard__tab(v-show="$store.state.dashboard.activeTab === 'stat' || $store.state.dashboard.activeTab === 'history'")
          SharedEmptyData(text="No stat for this period")

    //- stat & history
    template(v-else)
      transition(name="animation-tab")
        .dashboard__wrap
          .dashboard__tab(v-show="$store.state.dashboard.activeTab === 'stat'")
            StatPc

      transition(name="animation-tab")
        .dashboard__wrap
          .dashboard__tab._trns(v-show="$store.state.dashboard.activeTab === 'history'")
            TrnsList(:size="50" :key="$store.state.filter.date")

      //- Dashboard Overview
      transition(name="animation-tab")
        .dashboard__wrap
          .dashboard__tab._trns(v-show="$store.state.dashboard.activeTab === 'overview'")
            DashboardOverview

    transition(name="animation-tab")
      .dashboard__tab(v-if="$store.state.dashboard.activeTab === 'balance'")
        StatChartBalance(v-if="$store.getters['trns/hasTrns']")
        StatPc

    transition(name="animation-tab")
      .dashboard__tab(v-if="$store.state.dashboard.activeTab === 'analytics'")
        Analytics
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.dashboard__chart
  opacity .8
  padding $m7 0

  &:hover
    opacity 1

.chartBlock
  z-index 10
  position sticky
  top 0
  background var(--c-bg-2)

.dashboard
  overflow hidden
  overflow-y scroll
  scrollbar()

  &__wrap
    max-width 1100px
    padding 0px 60px

  &__content
    position relative

  &__tab
    position absolute
    top 0
    left 0
    width 100%
    max-width 1100px
    padding-bottom 60px

    &._trns
      padding 60px 60px
      padding-top 30px
</style>
