<script>
import { computed, useContext } from '@nuxtjs/composition-api'
import useChart from '~/components/chart/useChart'
import usePeriods from '~/components/periods/usePeriods'
import useFilter from '~/modules/filter/useFilter'
import useUIView from '~/components/layout/useUIView'

export default {
  name: 'ChartPeriods',

  setup () {
    const { store } = useContext()

    // Filter
    const { filterPeriodNameAllReplacedToYear } = useFilter()

    // Chart
    const { isShowDataLabels, toogleChartsView } = useChart()
    function saveChartsPeriodsToLocalStorage () {
      store.dispatch('ui/saveUiView')
    }

    function addPeriodOrGroup () {
      store.commit('chart/addElementsToChart', {
        periodName: filterPeriodNameAllReplacedToYear.value,
        periodType: 'showedPeriods'
      })
      saveChartsPeriodsToLocalStorage()
    }

    function removePeriodOrGroup () {
      store.commit('chart/removeElementsFromChart', {
        periodName: filterPeriodNameAllReplacedToYear.value,
        periodType: 'showedPeriods'
      })
      saveChartsPeriodsToLocalStorage()
    }

    // Periods
    const periods = computed(() => store.state.chart.periods)
    const { periodsNames } = usePeriods()

    const { ui, setUI } = useUIView()
    function toogleView (name) {
      setUI({ name, value: !ui[name] })
    }

    return {
      isShowDataLabels,
      toogleChartsView,
      addPeriodOrGroup,
      removePeriodOrGroup,

      periods,
      periodsNames,

      filterPeriodNameAllReplacedToYear,

      ui,
      toogleView
    }
  }
}
</script>

<template lang="pug">
.periods
  .periods__group
    .periodItem(
      @click="toogleView('showPieChart')"
    ): .mdi.mdi-chart-pie
    .periodItem(
      @click="toogleView('showCatsVerticalChart')"
    ): .mdi.mdi-poll
    .periodItem(
      @click="toogleView('showCatsHorizontalList')"
    ): .mdi.mdi-chart-timeline
    .periodItem(
      @click="toogleView('showRoundCats')"
    ): .mdi.mdi-chart-bubble
    //- .periodItem(
    //-   @click="toogleView('showHistory')"
    //- ): .mdi.mdi-jellyfish-outline

  .periods__group
    .periodItem(
      @click="removePeriodOrGroup"
    ): .mdi.mdi-minus

    .periodItem(
      v-for="periodItem in periodsNames"
      :key="periodItem.slug"
      :class="{ _active: filterPeriodNameAllReplacedToYear === periodItem.slug }"
      @click="$store.dispatch('filter/setPeriod', periodItem.slug)"
    )
      .periodItem__name {{ periodItem.name }}
      .periodItem__count(
        v-if="filterPeriodNameAllReplacedToYear === periodItem.slug"
      ) {{ $store.state.chart.periods[periodItem.slug].showedPeriods }}
    .periodItem(
      @click="addPeriodOrGroup"
    ): .mdi.mdi-plus

  .periods__group
    .periodItem(@click="toogleChartsView")
      .mdi.mdi-chart-line(v-if="periods[filterPeriodNameAllReplacedToYear].grouped")
      .mdi.mdi-chart-bar(v-else)

    .periodItem(@click="isShowDataLabels = !isShowDataLabels")
      .mdi.mdi-subtitles-outline
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.periods
  z-index 2
  position relative
  display grid
  grid-template-columns auto 1fr auto
  grid-column-gap $m9
  grid-row-gap 60px
  align-items center

  +media(600px)
    padding-top 8px

  &__group
    display flex
    align-items center
    justify-content center
    justify-self center

.periodItem
  cursor pointer
  flex-grow 1
  display flex
  align-items center
  justify-content center
  min-width 20px
  padding 10px $m6
  color var(--c-font-5)
  font-size 10px
  border-radius $m3
  anim()

  +media(600px)
    padding 10px 16px
    font-size 12px

  +media-hover()
    cursor pointer
    color var(--c-font-3)
    background var(--c-bg-5)
    border-radius 50px

  &._active
    color var(--c-blue-1)

  &__count
    padding-left $m4

  .mdi
    +media(600px)
      font-size 22px
</style>
