<script>
export default {
  data () {
    return {
      visibleContextMenu: false,
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
  },

  methods: {
    toogleShowStatGraphs () {
      this.$store.commit('dashboard/setDashboardActiveTab', 'stat')
      this.$store.dispatch('ui/toogleShowStatGraphs')
    },
    toogleVisibilityStatItems () {
      this.$store.commit('dashboard/setDashboardActiveTab', 'stat')
      this.$store.dispatch('ui/toogleVisibilityStatItems')
    },
    toogleVisibleCatsChart () {
      this.$store.commit('dashboard/setDashboardActiveTab', 'stat')
      this.$store.dispatch('ui/toogleVisibleCatsChart')
    }
  }
}
</script>

<template lang="pug">
.periodNav
  .periodNav__wrap
    .periodNav__group
      SharedContextMenu(
        :position="{ left: '-12px', top: true }"
        :visible="visiblePeriodMenu"
        @onClickOpener="visiblePeriodMenu = !visiblePeriodMenu"
      )
        template(slot="opener")
          SharedDropdown._noBd(:active="visiblePeriodMenu")
            template(slot="title"): SharedDate.dateSelecror

        template(slot="content")
          SharedContextMenuItem(
            :selected="$store.state.filter.period === 'day'"
            :title="$t('dates.day.simple')"
            icon="mdi mdi-weather-sunset-up"
            @onClick="$store.dispatch('filter/setPeriod', 'day')"
            @onClose="visiblePeriodMenu = !visiblePeriodMenu"
          )
          SharedContextMenuItem(
            :selected="$store.state.filter.period === 'week'"
            :title="$t('dates.week.simple')"
            icon="mdi mdi-calendar-week"
            @onClick="$store.dispatch('filter/setPeriod', 'week')"
            @onClose="visiblePeriodMenu = !visiblePeriodMenu"
          )
          SharedContextMenuItem(
            :selected="$store.state.filter.period === 'month'"
            :title="$t('dates.month.simple')"
            icon="mdi mdi-calendar"
            @onClick="$store.dispatch('filter/setPeriod', 'month')"
            @onClose="visiblePeriodMenu = !visiblePeriodMenu"
          )
          SharedContextMenuItem(
            :selected="$store.state.filter.period === 'year'"
            :title="$t('dates.year.simple')"
            icon="mdi mdi-calendar-star"
            @onClick="$store.dispatch('filter/setPeriod', 'year')"
            @onClose="visiblePeriodMenu = !visiblePeriodMenu"
          )
          SharedContextMenuItem(
            :selected="$store.state.filter.period === 'all'"
            :title="$t('dates.all.simple')"
            icon="mdi mdi-database"
            @onClick="$store.dispatch('filter/setPeriod', 'all')"
            @onClose="visiblePeriodMenu = !visiblePeriodMenu"
          )

    .periodNav__group
      ._align-right
        //- all stat chart
        .periodNav__item(
          v-if="!isEmptyData"
          v-show="$store.state.ui.statGraphsVisibility === 'visible'"
        )
          StatChartMenu(:showDropdown="true")

        //- customize
        .periodNav__item
          SharedContextMenu(
            :position="{ right: '-12px', top: true }"
            :visible="visibleContextMenu"
            @onClickOpener="visibleContextMenu = !visibleContextMenu")

            template(slot="opener")
              SharedDropdown._noBd(
                :active="visibleContextMenu"
                :title="$t('settings.customize')"
              )

            template(slot="content")
              template(v-if="!isEmptyData")
                SharedContextMenuItem(
                  :title="$t('stat.customize.showPeriodsChart')"
                  :checkboxValue="$store.state.ui.statGraphsVisibility === 'visible'"
                  showCheckbox
                  icon="mdi mdi-chart-bar-stacked"
                  @onClick="toogleShowStatGraphs"
                )

                SharedContextMenuItem(
                  icon="mdi mdi-folder-star"
                  :title="$t('stat.customize.showCategorisChart')"
                  :checkboxValue="$store.state.ui.catsChart === 'visible'"
                  showCheckbox
                  @onClick="toogleVisibleCatsChart"
                )

                SharedContextMenuItem(
                  :title="$t('stat.customize.showCategorisList')"
                  :checkboxValue="$store.state.ui.statItems === 'visible'"
                  showCheckbox
                  icon="mdi mdi-chart-gantt"
                  @onClick="toogleVisibilityStatItems"
                )

                SharedContextMenuItem(
                  :checkboxValue="$store.state.ui.catsChartPie === 'visible'"
                  :title="$t('stat.customize.showcatsChartPie')"
                  showCheckbox
                  icon="mdi mdi-chart-pie"
                  @onClick="$store.dispatch('ui/toogleVisibleCatsChartPie')"
                )

                .context-menu-sep

              SharedContextMenuItem(
                :title="$t('theme.change')"
                icon="mdi mdi-palette"
                @onClick="$store.dispatch('ui/changeTheme')"
              )
              SharedContextMenuItem(
                :title="$t('currency.selectBaseTitle')"
                icon="mdi mdi-currency-usd"
                @onClick="$store.commit('currencies/showBaseCurrenciesModal')"
                @onClose="visibleContextMenu = !visibleContextMenu"
              )
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
</style>
