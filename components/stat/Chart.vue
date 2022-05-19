<script setup lang="ts">
import useFilter from '~/modules/filter/useFilter'
import useStatChart from '~/components/stat/useStatChart'

const { $store } = useNuxtApp()
const { filterPeriodNameAllReplacedToYear } = useFilter()
const { chartState } = useStatChart()

const periods = computed(() => $store.state.chart.periods)
const filter = computed(() => $store.state.filter)

const chartType = computed(() => {
  let type = null
  periods.value[filterPeriodNameAllReplacedToYear.value].grouped
    ? type = 'column'
    : type = 'spline'

  return type
})
</script>

<template lang="pug">
.h-48(v-if="chartState.show.expense || chartState.show.income")
  LazyStatChartLines(
    :categoryId="filter.categoryId"
    :chartType="chartType"
    :isShowExpense="chartState.show.expense"
    :isShowIncome="chartState.show.income"
  )
</template>
