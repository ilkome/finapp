<script>
import ContextMenu from '@/components/shared/contextMenu/ContextMenu'
import ContextMenuItem from '@/components/shared/contextMenu/ContextMenuItem'
import Dropdown from '@/components/shared/dropdown/Dropdown'
import DashboardFilter from '@/components/dashboard/DashboardFilter'
import DashboardNav from '@/components/dashboard/DashboardNav'
import EmptyData from '@/components/shared/emptyData/EmptyData'
import StatChartsLine from '@/components/stat/StatChartsLine'
import StatSummaryPc from '@/components/stat/StatSummaryPc'
import StatPc from '@/components/stat/StatPc'
import TrnsList from '@/components/trns/list/TrnsList'

export default {
  components: {
    ContextMenu,
    ContextMenuItem,
    EmptyData,
    Dropdown,
    DashboardFilter,
    DashboardNav,
    StatChartsLine,
    StatPc,
    StatSummaryPc,
    TrnsList
  },

  data () {
    return {
      visiblePeriodMenu: false
    }
  },

  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    }
  }
}
</script>

<template lang="pug">
.statMain(v-show="activeTab === 'stat'")
  StatChartsLine

  .statMain__info
    .statMain__info__in
      DashboardNav
      StatSummaryPc
  DashboardFilter

  .statMain__box
    .statMain__header
      .statMain__header__group
        .statMain__header__item._tabName(
          @click="$store.commit('toogleDashboardTrnsHistory')"
          :class="{ _active: !$store.state.dashboard.showTrnsHistory }") Stat
        .statMain__header__item._tabName(
          @click="$store.commit('toogleDashboardTrnsHistory')"
          :class="{ _active: $store.state.dashboard.showTrnsHistory }") History

      .statMain__header__group._center
        .statMain__header__item._monthNav(
          @click="$store.dispatch('setPeriodPrev')"
          :class="{ _disable: $store.state.filter.period === 'all' || $store.getters.isFirstPeriodSelected }")
            .mdi.mdi-chevron-left
            | &nbsp; Next {{ $store.state.filter.period }}

        .statMain__header__item._monthNav(
          @click="$store.dispatch('setPeriodNext')"
          :class="{ _disable: $store.state.filter.period === 'all' || $store.getters.isLastPeriodSelected }")
            | Prev {{ $store.state.filter.period }}&nbsp;
            .mdi.mdi-chevron-right

      .statMain__header__group

    .statMain__content
      //- empty
      //------------------------------------------------
      template(v-if="$store.getters.stat.incomes.categoriesIds.length === 0 && $store.getters.stat.expenses.categoriesIds.length === 0 && $store.getters.selectedTrnsIdsWithDate.length === 0")
        EmptyData(text="No stat for this period")

      //- stat & history
      template(v-else)
        transition(name="animation-tab")
          .statMain__tab(v-show="!$store.state.dashboard.showTrnsHistory")
            StatPc

        transition(name="animation-tab")
          .statMain__tab._trns(v-show="$store.state.dashboard.showTrnsHistory")
            TrnsList
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/flex"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/scrollbar"

._minWidth
  min-width 120px

.trnsList
  display grid
  grid-template-columns repeat(3, 1fr)
  grid-column-gap $m7
  grid-row-gap $m7

.statMain
  scrollbar()
  overflow hidden
  overflow-y scroll

  &__info
    border-bottom 1px solid var(--c-bg-1)
    background var(--c-bg-3)

    &__in
      position relative
      max-width 1200px
      padding $m9 $mb2

      @media $media-laptop
        padding $m9 $mb2

      @media $media-xl
        padding $m9 $mb2

  &__box
    max-width 1200px

  &__header
    display grid
    grid-template-columns repeat(3, 1fr)
    padding $m9 $mb2
    grid-column-gap $m9
    padding-bottom 0

    &__group
      display-flex()
      flex 1 1 450px
      &._center
        justify-self center

    &__item
      display flex
      align-items center
      margin-right $m9
      padding $m3 $m6
      &._tabName
        font-header-4()
        color var(--c-font-5)
      &:last-child
        margin-right 0
      &._active
        color var(--c-font-3)
        border-bottom 2px solid var(--c-font-3)
      &._monthNav
        font-header-1()
        color var(--c-font-5)
        white-space nowrap
      &._disable
        opacity .5
      &:hover:not(._active):not(._disable):not(._spacer)
        background var(--c-bg-1)

  &__content
    position relative

  &__tab
    position absolute
    left 0
    top 0
    width 100%
    padding-bottom $m10

    &._trns
      padding $m9 $mb2
      padding-bottom $m10
</style>
