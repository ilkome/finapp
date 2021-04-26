<script>
import { computed, useContext } from '@nuxtjs/composition-api'
import useFilter from '~/modules/filter/useFilter'

export default {
  name: 'ChartMobileStatLines',

  setup () {
    const { store } = useContext()
    const { filterPeriodNameAllReplacedToYear } = useFilter()

    const activeTabStat = computed(() => store.state.ui.activeTabStat)
    const periods = computed(() => store.state.chart.periods)
    const filterPeriod = computed(() => store.state.filter.period)

    const chartType = computed(() => {
      let type = null
      periods.value[filterPeriodNameAllReplacedToYear.value].grouped
        ? type = 'column'
        : type = 'spline'

      return type
    })

    return {
      activeTabStat,
      periods,
      filterPeriod,
      chartType
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
      :chartType="chartType"
    )

  ChartPeriods
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.chart
  &__content
    height 190px
    padding 4px 0 0 4px
</style>
