<script lang="ts">
import { ref, computed, useContext, defineComponent } from '@nuxtjs/composition-api'
import usePeriods from '~/components/periods/usePeriods'

export default defineComponent({
  name: 'DashboardNav',

  setup () {
    const { store } = useContext()

    const visibleContextMenu = ref(false)
    const visiblePeriodMenu = ref(false)

    const isEmptyData = computed(() => {
      if (store.getters['trns/hasTrns'] &&
          store.getters['trns/selectedTrnsIdsWithDate'].length === 0) {
        return true
      }
      return false
    })

    function toogleShowStatGraphs () {
      store.commit('dashboard/setDashboardActiveTab', 'stat')
      store.dispatch('ui/toogleShowStatGraphs')
    }

    function toogleVisibilityStatItems () {
      store.commit('dashboard/setDashboardActiveTab', 'stat')
      store.dispatch('ui/toogleVisibilityStatItems')
    }

    function toogleVisibleCatsChart () {
      store.commit('dashboard/setDashboardActiveTab', 'stat')
      store.dispatch('ui/toogleVisibleCatsChart')
    }

    const filterPeriod = computed(() => store.state.filter.period)
    const { periodsNames } = usePeriods()
    function onSelectPeriod (period) {
      store.dispatch('filter/setPeriod', period)
    }

    return {
      visibleContextMenu,
      visiblePeriodMenu,

      isEmptyData,
      toogleShowStatGraphs,
      toogleVisibilityStatItems,
      toogleVisibleCatsChart,

      filterPeriod,
      periodsNames,
      onSelectPeriod
    }
  }
})
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
            template(slot="title"): SharedDate.dateSelector

        template(slot="content")
          SharedContextMenuItem(
            v-for="periodItem in periodsNames"
            :key="periodItem.slug"
            :icon="periodItem.icon"
            :selected="filterPeriod === periodItem.slug"
            :title="$t(`dates.${periodItem.slug}.simple`)"
            @onClick="onSelectPeriod(periodItem.slug)"
            @onClose="visiblePeriodMenu = !visiblePeriodMenu"
          )
          SharedContextMenuItem(
            :selected="filterPeriod === 'all'"
            :title="$t('dates.all.simple')"
            icon="mdi mdi-database"
            @onClick="onSelectPeriod('all')"
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
            @onClickOpener="visibleContextMenu = !visibleContextMenu"
          )

            template(slot="opener")
              SharedDropdown._noBd(
                :active="visibleContextMenu"
                :title="$t('settings.customize')"
              )

            template(slot="content")
              template(v-if="!isEmptyData")
                CustomizeMenu(
                  :isShowMainChart="false"
                  :isShowHistory="false"
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
@import '~assets/stylus/variables/animations'
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'
@import '~assets/stylus/variables/fonts'

._align-right
  display flex
  margin-left auto
  flex 0

._nav
  margin-right $m7
  &:last-child
    margin-right 0

.dateSelector
  cursor pointer
  display flex
  align-items center
  height 40px
  margin -8px -12px
  padding 8px 12px
  font-size 22px
  border 1px solid transparent
  font-header-1()

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
      margin-left (- $m6);
      padding-right 0
</style>
