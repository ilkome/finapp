<script>
import useFilter from '~/modules/filter/useFilter'
import useStatChart from '~/components/stat/useStatChart'

export default {
  setup () {
    const { $store } = useNuxtApp()
    const { filterPeriodNameAllReplacedToYear } = useFilter()
    const { chartState } = useStatChart()

    const activeTabStat = computed(() => $store.state.ui.activeTabStat)
    const periods = computed(() => $store.state.chart.periods)
    const filter = computed(() => $store.state.filter)
    const filterPeriod = computed(() => $store.state.filter.period)

    const chartType = computed(() => {
      let type = null
      periods.value[filterPeriodNameAllReplacedToYear.value].grouped
        ? type = 'column'
        : type = 'spline'

      return type
    })

    return {
      chartState,
      activeTabStat,
      periods,
      filter,
      filterPeriod,
      chartType
    }
  }
}
</script>

<template lang="pug">
.chart.px-3(v-if="chartState.show.expenses || chartState.show.incomes")
  LazyChartStatChartLines(
    :categoryId="filter.categoryId"
    :chartType="chartType"
    :isShowExpenses="chartState.show.expenses"
    :isShowIncomes="chartState.show.incomes"
  )
</template>

<style lang="stylus" scoped>
.chart
  height 190px
</style>
