<script setup lang="ts">
import useChart from '~/components/chart/useChart'
import useFilter from '~/modules/filter/useFilter'
import useStat from '~/modules/stat/useStat'
import useUIView from '~/components/layout/useUIView'
import useStatChart from '~/components/stat/useStatChart'

const { $store } = useNuxtApp()
const { chartState, toogleChart } = useStatChart()

const { ui, setUI } = useUIView()
function toogleView(name) {
  setUI({ name, value: !ui[name] })
}

const { isEmptyStat } = useStat()
const periods = computed(() => $store.state.chart.periods)
const { filterPeriodNameAllReplacedToYear } = useFilter()
const { isShowDataLabels, toogleChartsView } = useChart()
</script>

<template lang="pug">
.flex-center(v-if="!isEmptyStat")
  .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
    :class="{ 'text-skin-item-base-up': chartState.show.incomes }"
    @click="toogleChart('incomes')"
  ): .mdi.mdi-arrow-down-thin-circle-outline

  .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
    :class="{ 'text-skin-item-base-up': chartState.show.expenses }"
    @click="toogleChart('expenses')"
  ):  .mdi.mdi-arrow-up-thin-circle-outline

  .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
    @click="toogleChartsView"
  )
    .mdi.mdi-chart-line(v-if="periods[filterPeriodNameAllReplacedToYear].grouped")
    .mdi.mdi-chart-bar(v-if="!periods[filterPeriodNameAllReplacedToYear].grouped")

  .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
    :class="{ 'text-skin-item-base-up': isShowDataLabels }"
    @click="isShowDataLabels = !isShowDataLabels"
  )
    .mdi.mdi-subtitles-outline
</template>
