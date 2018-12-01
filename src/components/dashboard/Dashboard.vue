<script>
import ContextMenu from '@/components/shared/contextMenu/ContextMenu'
import ContextMenuItem from '@/components/shared/contextMenu/ContextMenuItem'
import Dropdown from '@/components/shared/dropdown/Dropdown'
import DashboardFilter from '@/components/dashboard/DashboardFilter'
import DashboardNav from '@/components/dashboard/DashboardNav'
import StatChartsLine from '@/components/stat/StatChartsLine'
import StatSummaryPc from '@/components/stat/StatSummaryPc'
import StatPc from '@/components/stat/StatPc'
import TrnsList from '@/components/trns/list/TrnsList'

export default {
  components: {
    ContextMenu,
    ContextMenuItem,
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
    DashboardNav
    StatSummaryPc
  DashboardFilter

  .statMain__header
    .statMain__header__group
      .statMain__header__item._tabName(
        @click="$store.commit('toogleDashboardTrnsHistory')"
        :class="{ _active: !$store.state.dashboard.showTrnsHistory }") Stat
      .statMain__header__item._tabName(
        @click="$store.commit('toogleDashboardTrnsHistory')"
        :class="{ _active: $store.state.dashboard.showTrnsHistory }") History

    .statMain__header__group._center
      .statMain__header__item
        .d-button-cirle._nav(
          @click="$store.dispatch('setPeriodPrev')"
          :class="{ _disable: $store.state.filter.period === 'all' || $store.getters.isFirstPeriodSelected }"
        ): .mdi.mdi-chevron-left

      .statMain__header__item
        ContextMenu._dark(
          :position="{ right: true, top: true }"
          :visible="visiblePeriodMenu"
          v-on:onClickOpener="visiblePeriodMenu = !visiblePeriodMenu")
          template(slot="opener")
            Dropdown._minWidth(
              :active="visiblePeriodMenu"
              :title="$store.state.filter.period")
          template(slot="content")
            ContextMenuItem(
              icon="mdi mdi-weather-sunset-up"
              title="Day"
              :selected="$store.state.filter.period === 'day'"
              v-on:onClick="$store.dispatch('setPeriod', 'day')"
              v-on:onClose="visiblePeriodMenu = !visiblePeriodMenu")
            ContextMenuItem(
              icon="mdi mdi-calendar-week"
              title="Week"
              :selected="$store.state.filter.period === 'week'"
              v-on:onClick="$store.dispatch('setPeriod', 'week')"
              v-on:onClose="visiblePeriodMenu = !visiblePeriodMenu")
            ContextMenuItem(
              icon="mdi mdi-calendar"
              title="Month"
              :selected="$store.state.filter.period === 'month'"
              v-on:onClick="$store.dispatch('setPeriod', 'month')"
              v-on:onClose="visiblePeriodMenu = !visiblePeriodMenu")
            ContextMenuItem(
              icon="mdi mdi-calendar-star"
              title="Year"
              :selected="$store.state.filter.period === 'year'"
              v-on:onClick="$store.dispatch('setPeriod', 'year')"
              v-on:onClose="visiblePeriodMenu = !visiblePeriodMenu")
            ContextMenuItem(
              icon="mdi mdi-database"
              title="Show all"
              :selected="$store.state.filter.period === 'all'"
              v-on:onClick="$store.dispatch('setPeriod', 'all')"
              v-on:onClose="visiblePeriodMenu = !visiblePeriodMenu")
      .statMain__header__item
        .d-button-cirle._nav(
          @click="$store.dispatch('setPeriodNext')"
          :class="{ _disable: $store.state.filter.period === 'all' || $store.getters.isLastPeriodSelected }"
        ): .mdi.mdi-chevron-right

  .statMain__content
    transition(name="animation-tab")
      .statMain__tab(v-show="!$store.state.dashboard.showTrnsHistory")
        StatPc

    transition(name="animation-tab")
      .statMain__tab._trns(v-show="$store.state.dashboard.showTrnsHistory")
        TrnsList
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
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
    position relative
    padding $m9 $mb2
    background var(--c-bg-3)
    border-bottom 1px solid var(--c-bg-1)

    @media $media-laptop
      padding $m9 $mb2

    @media $media-xl
      padding $m9 $mb2

  &__header
    display grid
    grid-template-columns repeat(3, 1fr)
    align-items center
    padding $m9 $mb2
    padding-bottom 0

    &__group
      display-flex()
      &._center
        justify-content center

    &__item
      margin-right $m9
      &._tabName
        font-header-4()
        color var(--c-font-5)
      &:last-child
        margin-right 0
      &._active
        color var(--c-font-3)

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
