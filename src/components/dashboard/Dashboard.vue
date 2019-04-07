<script>
import DashboardFilter from '@/components/dashboard/DashboardFilter'
import DashboardNav from '@/components/dashboard/DashboardNav'
import DashboardStatControl from '@/components/dashboard/DashboardStatControl'
import EmptyData from '@/components/shared/emptyData/EmptyData'
import StatChartsLine from '@/components/stat/StatChartsLine'
import StatSummaryPc from '@/components/stat/StatSummaryPc'
import StatPc from '@/components/stat/StatPc'
import TrnsList from '@/components/trns/list/TrnsList'

export default {
  components: {
    EmptyData,
    DashboardFilter,
    DashboardNav,
    DashboardStatControl,
    StatChartsLine,
    StatPc,
    StatSummaryPc,
    TrnsList
  },

  data () {
    return {
      visiblePeriodMenu: false
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

  .dashboard__content
    .dashboard__wrap
      //- empty
      //------------------------------------------------
      template(v-if="$store.getters.stat.incomes.categoriesIds.length === 0 && $store.getters.stat.expenses.categoriesIds.length === 0 && $store.getters.selectedTrnsIdsWithDate.length === 0")
        EmptyData(text="No stat for this period")

      //- stat & history
      template(v-else)
        transition(name="animation-tab")
          .dashboard__tab(v-show="!$store.state.dashboard.showTrnsHistory")
            StatPc

        transition(name="animation-tab")
          .dashboard__tab._trns(v-show="$store.state.dashboard.showTrnsHistory")
            TrnsList
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/scrollbar"

.trnsList
  display grid
  grid-template-columns repeat(3, 1fr)
  grid-column-gap $m7
  grid-row-gap $m7

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
    padding-bottom 60px

    &._trns
      padding 60px 60px
      padding-top 30px
</style>
