<script>
import { ref, computed, useContext } from '@nuxtjs/composition-api'
import useChart from '~/components/chart/useChart'
import usePeriods from '~/components/periods/usePeriods'
import useFilter from '~/modules/filter/useFilter'
import useUIView from '~/components/layout/useUIView'
import useStat from '~/modules/stat/useStat'

export default {
  name: 'ChartPeriods',

  setup () {
    const { store } = useContext()
    const { isEmptyStat } = useStat()

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

    const visibleContextMenu = ref(false)

    return {
      isEmptyStat,
      isShowDataLabels,
      toogleChartsView,
      addPeriodOrGroup,
      removePeriodOrGroup,

      periods,
      periodsNames,

      filterPeriodNameAllReplacedToYear,

      ui,
      toogleView,

      visibleContextMenu
    }
  }
}
</script>

<template lang="pug">
.periods
  .periods__custom
    SharedContextMenu(
      :position="{ left: '-12px', top: true }"
      :visible="visibleContextMenu"
      @onClickOpener="visibleContextMenu = !visibleContextMenu"
    )
      template(slot="opener")
        .periodItem._tune
          .periodItem__icon: .mdi.mdi-tune
          .periodItem__text {{ $t('settings.customize') }}

      template(slot="content")
        template(v-if="!isEmptyStat")
          CustomizeMenu
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

  .periods__group
    .periodItem(
      v-for="periodItem in periodsNames"
      :key="periodItem.slug"
      :class="{ _active: filterPeriodNameAllReplacedToYear === periodItem.slug }"
      @click="$store.dispatch('filter/setPeriod', periodItem.slug)"
    )
      .periodItem__name {{ periodItem.name }}

  .periods__group(v-if="!isEmptyStat")
    .periodItem(
      @click="removePeriodOrGroup"
    ): .mdi.mdi-minus
    .periodItem__count {{ $store.state.chart.periods[filterPeriodNameAllReplacedToYear].showedPeriods }}
    .periodItem(
      @click="addPeriodOrGroup"
    ): .mdi.mdi-plus

  .periods__group(v-if="!isEmptyStat")
    .periodItem(@click="toogleChartsView")
      .mdi.mdi-chart-line(v-if="periods[filterPeriodNameAllReplacedToYear].grouped")
      .mdi.mdi-chart-bar(v-else)

    .periodItem(@click="isShowDataLabels = !isShowDataLabels")
      .mdi.mdi-subtitles-outline
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.periods
  z-index 10
  position relative
  display grid
  grid-template-columns auto 1fr auto auto
  grid-column-gap $m5
  align-items center
  margin 0 (- 0)

  +media(600px)
    margin 0 (- $m4)
    grid-column-gap $m9

  +media(800px)
    margin 0 (- $m6)

  &__group
    display flex
    align-items center
    justify-content center
    justify-self center

.periodItem
  cursor pointer
  position relative
  flex-grow 1
  display flex
  align-items center
  justify-content center
  min-width 20px
  padding 10px $m5
  color var(--c-font-5)
  font-size 10px
  border-radius $m3
  anim()

  +media(400px)
    font-size 12px

  +media(600px)
    padding $m6 $m6
    font-size 12px

  +media(800px)
    padding $m6 $m7

  +media-hover()
    cursor pointer
    color var(--c-font-3)
    background var(--c-bg-5)
    border-radius 50px

  &._active
    color var(--c-blue-1)

  &__count
    color var(--c-font-3)
    font-size 14px

  .mdi
    +media(600px)
      font-size 18px

  &._history
    display none

    +media(800px)
      display flex

  &._tune
    color var(--c-font-3)

  &__icon
    padding-right $m5
    .mdi
      font-size 18px
</style>
