<script lang="ts">
import { computed, useNuxtApp, defineComponent } from '#app'
import useChart from '~/components/chart/useChart'
import useFilter from '~/modules/filter/useFilter'
import useStat from '~/modules/stat/useStat'
import useUIView from '~/components/layout/useUIView'
import useStatChart from '~/components/stat/useStatChart'

export default defineComponent({
  setup () {
    const { $store } = useNuxtApp()
    const { chartState, toogleChart } = useStatChart()

    const activeTabStat = computed(() => $store.state.ui.activeTabStat)

    const { ui, setUI } = useUIView()
    function toogleView (name) {
      setUI({ name, value: !ui[name] })
    }

    const { isEmptyStat } = useStat()
    const periods = computed(() => $store.state.chart.periods)
    const { filterPeriodNameAllReplacedToYear } = useFilter()
    const { isShowDataLabels, toogleChartsView } = useChart()

    return {
      chartState,
      toogleChart,

      activeTabStat,
      toogleView,
      periods,
      filterPeriodNameAllReplacedToYear,

      ui,
      isEmptyStat,
      isShowDataLabels,
      toogleChartsView
    }
  }
})
</script>

<template lang="pug">
.flex.justify-between.-mt-1.py-2.px-3
  .bar.overflow-hidden.flex.rounded
    .periodItem(
      :class="{ _active: ui.showPieChart }"
      @click="toogleView('showPieChart')"
    ): .mdi.mdi-chart-pie

    .periodItem(
      :class="{ _active: ui.showCatsVerticalChart }"
      @click="toogleView('showCatsVerticalChart')"
    ): .mdi.mdi-poll

    .periodItem(
      :class="{ _active: ui.showRoundCats }"
      @click="toogleView('showRoundCats')"
    ): .mdi.mdi-chart-bubble

    .periodItem(
      :class="{ _active: ui.showCatsHorizontalList }"
      @click="toogleView('showCatsHorizontalList')"
    ): .mdi.mdi-chart-timeline

  .bar.overflow-hidden.flex.ml-2.rounded(v-if="!isEmptyStat")
    .periodItem(
      :class="{ _active: chartState.show.incomes }"
      @click="toogleChart('incomes')"
    ): .mdi.mdi-arrow-down-thin-circle-outline
    .periodItem(
      :class="{ _active: chartState.show.expenses }"
      @click="toogleChart('expenses')"
    ):  .mdi.mdi-arrow-up-thin-circle-outline

    .periodItem(@click="toogleChartsView")
      .mdi.mdi-chart-line(v-if="periods[filterPeriodNameAllReplacedToYear].grouped")
      .mdi.mdi-chart-bar(v-else)

    .periodItem(@click="isShowDataLabels = !isShowDataLabels")
      .mdi.mdi-subtitles-outline
</template>

<style lang="stylus" scoped>
.bar
  background var(--c-bg-4)
  color var(--c-font-3)

  &__btn
    color $
    background var(--c-bg-4)
    +media-hover()
      &:not(._active)
        background var(--c-bg-6)

.periodItem
  cursor pointer
  width 34px
  padding $m5
  color var(--c-font-5)
  font-size 18px

  +media-hover()
    background var(--c-bg-5)

  &._active
    color var(--c-font-3)
</style>
