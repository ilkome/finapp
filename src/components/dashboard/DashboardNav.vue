<script>
import ChartMenu from '@/components/stat/chart/ChartMenu'
import ContextMenu from '@/components/shared/contextMenu/ContextMenu'
import ContextMenuItem from '@/components/shared/contextMenu/ContextMenuItem'
import Date from '@/components/shared/date/Date'
import Dropdown from '@/components/shared/dropdown/Dropdown'

export default {
  components: {
    ChartMenu,
    ContextMenu,
    ContextMenuItem,
    Date,
    Dropdown
  },

  data () {
    return {
      visibleContextMenu: false,
      visiblePeriodMenu: false
    }
  }
}
</script>

<template lang="pug">
.periodNav
  .periodNav__wrap
    .periodNav__group
      ContextMenu._dark(
        :position="{ left: '-12px', top: true }"
        :visible="visiblePeriodMenu"
        v-on:onClickOpener="visiblePeriodMenu = !visiblePeriodMenu")
        template(slot="opener")
          Dropdown._noBd(
            :active="visiblePeriodMenu")
            template(slot="title"): Date.dateSelecror

        template(slot="content")
          ContextMenuItem(
            icon="mdi mdi-weather-sunset-up"
            :title="$lang.dates.day.simple"
            :selected="$store.state.filter.period === 'day'"
            v-on:onClick="$store.dispatch('setPeriod', 'day')"
            v-on:onClose="visiblePeriodMenu = !visiblePeriodMenu")
          ContextMenuItem(
            icon="mdi mdi-calendar-week"
            :title="$lang.dates.week.simple"
            :selected="$store.state.filter.period === 'week'"
            v-on:onClick="$store.dispatch('setPeriod', 'week')"
            v-on:onClose="visiblePeriodMenu = !visiblePeriodMenu")
          ContextMenuItem(
            icon="mdi mdi-calendar"
            :title="$lang.dates.month.simple"
            :selected="$store.state.filter.period === 'month'"
            v-on:onClick="$store.dispatch('setPeriod', 'month')"
            v-on:onClose="visiblePeriodMenu = !visiblePeriodMenu")
          ContextMenuItem(
            icon="mdi mdi-calendar-star"
            :title="$lang.dates.year.simple"
            :selected="$store.state.filter.period === 'year'"
            v-on:onClick="$store.dispatch('setPeriod', 'year')"
            v-on:onClose="visiblePeriodMenu = !visiblePeriodMenu")
          ContextMenuItem(
            icon="mdi mdi-database"
            :title="$lang.dates.all"
            :selected="$store.state.filter.period === 'all'"
            v-on:onClick="$store.dispatch('setPeriod', 'all')"
            v-on:onClose="visiblePeriodMenu = !visiblePeriodMenu")

    .periodNav__group
      ._align-right
        //- all stat chart
        .periodNav__item(v-show="$store.state.ui.statGraphsVisibility === 'visible'")
          ChartMenu(:showDropdown="true")

        //- customize
        .periodNav__item
          ContextMenu(
            :position="{ right: '-12px', top: true }"
            :visible="visibleContextMenu"
            v-on:onClickOpener="visibleContextMenu = !visibleContextMenu")
            template(slot="opener")
              Dropdown._noBd(
                :active="visibleContextMenu"
                :title="$lang.settings.customize")
            template(slot="content")
              ContextMenuItem(
                icon="mdi mdi-chart-bar-stacked"
                title="Periods chart"
                :showCheckbox="true"
                :checkboxValue="$store.state.ui.statGraphsVisibility === 'visible'"
                v-on:onClick="$store.dispatch('toogleShowStatGraphs')")
              ContextMenuItem(
                icon="mdi mdi-chart-bubble"
                title="Cats chart"
                :showCheckbox="true"
                :checkboxValue="$store.state.ui.catsChart === 'visible'"
                v-on:onClick="$store.dispatch('toogleVisibleCatsChart')")
              ContextMenuItem(
                icon="mdi mdi-chart-gantt"
                title="Cats stat"
                :showCheckbox="true"
                :checkboxValue="$store.state.ui.statItems === 'visible'"
                v-on:onClick="$store.dispatch('toogleVisibilityStatItems')")

              .context-menu-sep

              ContextMenuItem(
                icon="mdi mdi-palette"
                title="Change theme"
                v-on:onClick="$store.dispatch('changeTheme')")
              ContextMenuItem(
                icon="mdi mdi-currency-usd"
                title="Change base currency"
                v-on:onClick="$store.commit('showBaseCurrenciesModal')"
                v-on:onClose="visibleContextMenu = !visibleContextMenu")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/animations"
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/fonts"

._align-right
  margin-left auto
  flex 0
  display flex

._nav
  margin-right $m7
  &:last-child
    margin-right 0

.dateSelecror
  display flex
  align-items center
  cursor pointer
  border 1px solid transparent
  height 40px
  padding 8px 12px
  margin -8px -12px
  font-header-1()
  font-size 22px

.d-button
  display inline-flex
  align-items center
  justify-content center
  padding $m7 $m8
  font-header-1()
  color var(--c-font-4)

.periodNav
  background var(--c-bg-4)

  &__wrap
    display flex
    align-items center
    max-width 1100px
    padding 5px $mb2
    padding-bottom 6px

  &__group
    display flex
    flex 1 1
    justify-content space-between

  &__item
    display flex
    align-items center
    padding-right 50px
    &:last-child
      padding-right 0

    &._last
      display flex
      align-items flex-start
      margin-left auto
      padding-right 0
      margin-left (- $m6)

    .headerLink._periods
      display flex
      align-items center
      height 40px
      padding 0 $m7
      margin-right (- $m5)
      font-size 16px

      &._active
        color var(--c-font-2)
        background none
</style>
