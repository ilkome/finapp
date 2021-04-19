<script>
import { computed, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'ChartMobileStatLines',

  setup () {
    const { store } = useContext()

    const activeTabStat = computed(() => store.state.ui.activeTabStat)
    const periods = computed(() => store.state.chart.periods)
    const filterPeriod = computed(() => store.state.filter.period)

    return {
      activeTabStat,
      periods,
      filterPeriod
    }
  }
}
</script>

<template lang="pug">
.chart
  .chart__content
    StatChartLines(
      :isShowIncomes="activeTabStat === 'incomes' || activeTabStat === 'details' || activeTabStat === 'history'"
      :isShowExpenses="activeTabStat === 'expenses' || activeTabStat === 'details' || activeTabStat === 'history'"
      :chartType="periods[filterPeriod].grouped ? 'column' : 'spline'"
    )

  ChartPeriods
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.chart
  &__content
    height 190px
    padding 0 0 0 4px
</style>
