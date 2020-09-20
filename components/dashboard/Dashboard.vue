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
    }
  }
}
</script>

<template lang="pug">
.dashboard(v-show="$store.state.ui.activeTab === 'stat'")
  StatChartsLine
  DashboardNav
  StatSummaryPc
  DashboardFilter
  DashboardStatControl

  template(v-if="!$store.getters['trns/hasTrns']")
    .startSomething
      .options__item(v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']")
        Button._grey._center(
          :title="$lang.createTrn"
          @onClick="$store.dispatch('trnForm/openTrnForm', { action: 'create' })"
        )

      .options__item(v-if="!$store.getters['wallets/hasWallets'] && !$store.getters['categories/hasCategories']")
        h4 {{ $lang.welcome.firstRun.text }}
        Button._blue._center(
          size="xl"
          :title="$lang.welcome.firstRun.btn"
          @onClick="$router.push('/welcome')"
        )

      .options__item(v-if="$store.state.demo.hasDemo")
        .options__or
          .options__or__border
          .options__or__text {{ $lang.welcome.or }}

        h4 {{ $lang.welcome.demo.text }}
        Button._blue._center(
          size="xl"
          :title="$lang.welcome.demo.btn"
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
        StatChartDonut(v-if="$store.getters['trns/hasTrns']")
        StatPc
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/scroll"

.dashboard
  overflow hidden
  overflow-y scroll
  scrollbar()

  &__wrap
    position relative
    max-width 1100px
    padding 0px 60px

  &__content
    position relative

  &__tab
    position absolute
    left 0
    top 0
    width 100%
    max-width 1100px
    padding-bottom 60px

    &._trns
      padding 60px 60px
      padding-top 30px

.startSomething
  padding 100px 0
  display flex
  flex-flow column
  align-items center
  justify-content center

  .options__item
    margin-bottom 40px

  .options__or
    display flex
    align-items center
    justify-content center
    position relative
    padding $m9 0
    text-align center
    color var(--c-font-4)
    &__text
      position relative
      padding $m7
      background var(--c-bg-2)
    &__border
      position absolute
      left 0
      top 50%
      width 100%
      height 1px
      background var(--c-bg-6)
</style>
