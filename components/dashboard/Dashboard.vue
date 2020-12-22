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
      console.log(statCurrentPeriod)
      if (statCurrentPeriod.incomes.categoriesIds.length === 0 &&
          statCurrentPeriod.expenses.categoriesIds.length === 0 &&
          this.$store.getters['trns/selectedTrnsIdsWithDate'].length === 0) {
        return true
      }
      return false
    },

    periods () {
      console.log(this.$store.state.chart.periods)
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
  .dashboard__wrap(v-if="$store.state.ui.statGraphsVisibility === 'visible'")
    .dashboard__chart
      StatChartLines(
        v-if="filterPeriod !== 'all'"
        :chartType="periods[filterPeriod].grouped ? 'column' : 'line'"
      )

  .chartBlock
    DashboardNav
    StatSummaryPc
    DashboardFilter
    DashboardStatControl

  template(v-if="!$store.getters['trns/hasTrns']")
    .startSomething
      .options__item(v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']")
        Button._grey._center(
          :title="$t('createTrn')"
          @onClick="$store.dispatch('trnForm/openTrnForm', { action: 'create' })"
        )

      .options__item(v-if="!$store.getters['wallets/hasWallets'] && !$store.getters['categories/hasCategories']")
        h4 {{ $t('welcome.firstRun.text') }}

        Button._blue._center(
          :title="$t('welcome.firstRun.btn')"
          size="xl"
          @onClick="$router.push('/welcome')"
        )

      .options__item(v-if="$store.state.demo.hasDemo")
        .options__or
          .options__or__border
          .options__or__text {{ $t('welcome.or') }}

        h4 {{ $t('welcome.demo.text') }}
        Button._blue._center(
          size="xl"
          :title="$t('welcome.demo.btn')"
          @onClick="$store.dispatch('demo/createDemo')"
        )

  .dashboard__content(v-if="$store.getters['trns/hasTrns']")
    //- empty
    //------------------------------------------------
    template(v-if="isEmptyData")
      transition(name="animation-tab")
        .dashboard__wrap
          .dashboard__tab(v-show="$store.state.dashboard.activeTab === 'stat' || $store.state.dashboard.activeTab === 'history'")
          EmptyData(text="No stat for this period")

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

.startSomething
  display flex
  align-items center
  justify-content center
  padding 100px 0
  flex-flow column

  .options__item
    margin-bottom 40px

  .options__or
    position relative
    display flex
    align-items center
    justify-content center
    padding $m9 0
    color var(--c-font-4)
    text-align center
    &__text
      position relative
      padding $m7
      background var(--c-bg-2)
    &__border
      position absolute
      top 50%
      left 0
      width 100%
      height 1px
      background var(--c-bg-6)
</style>
