<script setup lang="ts">
import useChart from '~/components/chart/useChart'
import useFilter from '~/components/filter/useFilter'
import useStatChart from '~/components/stat/useStatChart'

const { $store } = useNuxtApp()
const { chartState, toggleChart } = useStatChart()
const periods = computed(() => $store.state.chart.periods)
const { filterPeriodNameAllReplacedToYear } = useFilter()
const { isShowDataLabels, toggleChartsView } = useChart()
</script>

<template lang="pug">
.flex-center
  .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
    :class="{ 'text-skin-item-base-up': chartState.show.income }"
    @click="toggleChart('income')"
  ): .mdi.mdi-arrow-down-thin-circle-outline

  .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
    :class="{ 'text-skin-item-base-up': chartState.show.expense }"
    @click="toggleChart('expense')"
  ):  .mdi.mdi-arrow-up-thin-circle-outline

  .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
    :class="{ 'text-skin-item-base-up': chartState.show.sum }"
    @click="toggleChart('sum')"
  ):  .mdi.mdi-chart-gantt

  .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
    @click="toggleChartsView"
  )
    .mdi.mdi-chart-line(v-if="periods[filterPeriodNameAllReplacedToYear].grouped")
    .mdi.mdi-chart-bar(v-if="!periods[filterPeriodNameAllReplacedToYear].grouped")

  .cursor-pointer.w-10.py-2.px-3.flex-center.rounded-md.hocus_bg-skin-item-main-hover(
    :class="{ 'text-skin-item-base-up': isShowDataLabels }"
    @click="isShowDataLabels = !isShowDataLabels"
  )
    .mdi.mdi-subtitles-outline
</template>
