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
  .chart__name
    ChartPeriods

  .chart__content
    StatChartLines(
      :isShowIncomes="activeTabStat === 'incomes' || activeTabStat === 'details' || activeTabStat === 'history'"
      :isShowExpenses="activeTabStat === 'expenses' || activeTabStat === 'details' || activeTabStat === 'history'"
      :chartType="periods[filterPeriod].grouped ? 'column' : 'spline'"
    )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.chart
  &__content
    height 220px
    padding 10px 0 0 4px
</style>
