<script>
import { computed, useContext } from '@nuxtjs/composition-api'
import useChart from '~/components/chart/useChart'
import usePeriods from '~/components/periods/usePeriods'
import useFilter from '~/modules/filter/useFilter'

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

    return {
      isShowDataLabels,
      toogleChartsView,
      addPeriodOrGroup,
      removePeriodOrGroup,

      periods,
      periodsNames,

      filterPeriodNameAllReplacedToYear
    }
  }
}
</script>

<template lang="pug">
.periods
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

  .periodItem(@click="toogleChartsView")
    .mdi.mdi-chart-bar(v-if="periods[filterPeriodNameAllReplacedToYear].grouped")
    .mdi.mdi-chart-line(v-else)

  .periodItem(@click="isShowDataLabels = !isShowDataLabels")
    .mdi.mdi-subtitles-outline
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.periods
  z-index 2
  position relative
  display flex
  align-items center

.periodItem
  cursor pointer
  flex-grow 1
  display flex
  align-items center
  justify-content center
  min-width 40px
  padding 10px $m6
  color var(--c-font-5)
  font-size 10px
  border-radius $m3

  &:active
    background var(--c-bg-5)

  +media-hover()
    color var(--c-font-2)
    background var(--c-blue-1)

  &._active
    color var(--c-font-3)

  &__count
    padding-left $m4
</style>
