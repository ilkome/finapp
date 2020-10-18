<script>
export default {
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
      ContextMenu(
        :position="{ left: '-12px', top: true }"
        :visible="visiblePeriodMenu"
        @onClickOpener="visiblePeriodMenu = !visiblePeriodMenu")
        template(slot="opener")
          Dropdown._noBd(
            :active="visiblePeriodMenu")
            template(slot="title"): Date.dateSelecror

        template(slot="content")
          ContextMenuItem(
            icon="mdi mdi-weather-sunset-up"
            :title="$lang.dates.day.simple"
            :selected="$store.state.filter.period === 'day'"
            @onClick="$store.dispatch('filter/setPeriod', 'day')"
            @onClose="visiblePeriodMenu = !visiblePeriodMenu")
          ContextMenuItem(
            icon="mdi mdi-calendar-week"
            :title="$lang.dates.week.simple"
            :selected="$store.state.filter.period === 'week'"
            @onClick="$store.dispatch('filter/setPeriod', 'week')"
            @onClose="visiblePeriodMenu = !visiblePeriodMenu")
          ContextMenuItem(
            icon="mdi mdi-calendar"
            :title="$lang.dates.month.simple"
            :selected="$store.state.filter.period === 'month'"
            @onClick="$store.dispatch('filter/setPeriod', 'month')"
            @onClose="visiblePeriodMenu = !visiblePeriodMenu")
          ContextMenuItem(
            icon="mdi mdi-calendar-star"
            :title="$lang.dates.year.simple"
            :selected="$store.state.filter.period === 'year'"
            @onClick="$store.dispatch('filter/setPeriod', 'year')"
            @onClose="visiblePeriodMenu = !visiblePeriodMenu")
          ContextMenuItem(
            icon="mdi mdi-database"
            :title="$lang.dates.all"
            :selected="$store.state.filter.period === 'all'"
            @onClick="$store.dispatch('filter/setPeriod', 'all')"
            @onClose="visiblePeriodMenu = !visiblePeriodMenu")

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
            @onClickOpener="visibleContextMenu = !visibleContextMenu")

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
                @onClick="$store.dispatch('ui/toogleShowStatGraphs')")

              ContextMenuItem(
                icon="mdi mdi-folder-star"
                title="Cats chart"
                :showCheckbox="true"
                :checkboxValue="$store.state.ui.catsChart === 'visible'"
                @onClick="$store.dispatch('ui/toogleVisibleCatsChart')")

              ContextMenuItem(
                icon="mdi mdi-chart-gantt"
                title="Cats stat"
                :showCheckbox="true"
                :checkboxValue="$store.state.ui.statItems === 'visible'"
                @onClick="$store.dispatch('ui/toogleVisibilityStatItems')")

              .context-menu-sep

              ContextMenuItem(
                icon="mdi mdi-palette"
                title="Change theme"
                @onClick="$store.dispatch('ui/changeTheme')")
              ContextMenuItem(
                icon="mdi mdi-currency-usd"
                title="Change base currency"
                @onClick="$store.commit('currencies/showBaseCurrenciesModal')"
                @onClose="visibleContextMenu = !visibleContextMenu")
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/fonts"

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
    padding 5px 60px

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
