<script lang="ts">
import { Chart } from 'highcharts-vue'
import chartOptions from '~/components/stat/chart/chartOptions'
import useChart from '~/components/chart/useChart'
import useFilter from '~/modules/filter/useFilter'
import { getCategoriesIds, getTransferCategoriesIds } from '~/components/categories/getCategories'
import { getTotal } from '~/components/amount/getTotal'
import { getTrnsIds } from '~/components/trns/getTrns'

export default defineComponent({
  components: { Chart },

  props: {
    amountType: { type: String, default: null },
    categoryId: { type: String, default: null },
    isShowExpense: { type: Boolean, default: true },
    isShowIncome: { type: Boolean, default: true },
  },

  setup() {
    const { $store } = useNuxtApp()
    const { isShowDataLabels } = useChart()
    const { filterPeriodNameAllReplacedToYear, scrollTop } = useFilter()

    const periods = computed(() => $store.state.chart.periods)
    const chartType = computed(() => {
      let type = null
      periods.value[filterPeriodNameAllReplacedToYear.value].grouped
        ? type = 'column'
        : type = 'spline'

      return type
    })

    const chartObj = ref({})
    const chartCallback = (v) => { chartObj.value = v }

    const onClickChart = async (event) => {
      const chart = chartObj.value
      if (!chart)
        return

      const nEvent = await chart.pointer.normalize(event)
      let date = chart.series[0].searchPoint(nEvent, true)?.date || chart.series[1].searchPoint(nEvent, true)?.date || chart.series[2].searchPoint(nEvent, true)?.date
      setTimeout(() => {
        date = chart.series[0].searchPoint(nEvent, true)?.date || chart.series[1].searchPoint(nEvent, true)?.date || chart.series[2].searchPoint(nEvent, true)?.date
        if (date) {
          if ($store.state.filter.period === 'all')
            $store.dispatch('filter/setPeriod', 'year')

          $store.dispatch('filter/setDate', parseInt(date))
          scrollTop()
        }
      }, 100)
    }

    watch(() => $store.state.filter.date, async () => {
      await nextTick()

      const chart = chartObj.value
      if (!chartObj.value)
        return

      const chartSeriesIdx = chart.series[0].options.data.findIndex(v => +v.date === +$store.state.filter.date)
      if (chartSeriesIdx !== -1) {
        chart.xAxis[0].update({
          plotBands: [{
            color: 'var(--c-item-bg-active)',
            from: chartSeriesIdx + 0.5,
            to: chartSeriesIdx - 0.5,
          }],
        })
      }
    }, { immediate: true })

    return {
      onClickChart,
      chartCallback,
      isShowDataLabels,
      chartType,
      filterPeriodNameAllReplacedToYear,
      scrollTop,
    }
  },

  computed: {
    chartData() {
      const periodName = this.filterPeriodNameAllReplacedToYear
      const chartPeriods = this.$store.state.chart.periods
      const trnsItems = this.$store.state.trns.items
      const categoriesItems = this.$store.state.categories.items
      const walletsItems = this.$store.state.wallets.items
      const storeFilter = this.$store.state.filter
      const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)

      // diff periods from oldest trn and today
      const oldestTrnDate = this.$day(trnsItems[this.$store.getters['trns/firstCreatedTrnId']].date).endOf(periodName)
      let periodsToShow = this.$day().endOf(periodName).diff(oldestTrnDate, periodName) + 1
      const periodsWantToShow = chartPeriods[periodName].showedPeriods
      periodsToShow = periodsWantToShow >= periodsToShow ? periodsToShow : periodsWantToShow

      const categories = []
      const incomeData = []
      const expenseData = []
      const totalData = []

      for (let index = 0; index < periodsToShow; index++) {
        // count total period
        const periodDate = this.$day().startOf(periodName).subtract(index, periodName).valueOf()

        const categoriesIds = storeFilter.catsIds.length > 0 ? getCategoriesIds(storeFilter.catsIds, categoriesItems) : null
        const walletsIds = storeFilter.walletsIds.length > 0 ? storeFilter.walletsIds : null

        const trnsIds = getTrnsIds({
          trnsItems,
          walletsIds,
          categoriesIds,
          periodName,
          date: periodDate,
        })

        const { incomeTransactions, expenseTransactions, sumTransactions } = getTotal({
          trnsIds,
          trnsItems,
          walletsItems,
          transferCategoriesIds,
        })

        let format = 'MM'
        if (periodName === 'day')
          format = 'D.MM'
        if (periodName === 'week')
          format = 'D MMM'
        if (periodName === 'month')
          format = 'MMM'
        if (periodName === 'year')
          format = 'YYYY'
        const name = this.$day().startOf(periodName).subtract(index, periodName).format(format)

        // Income
        incomeData.unshift({
          date: periodDate,
          y: incomeTransactions,
        })
        // Expense
        expenseData.unshift({
          date: periodDate,
          y: expenseTransactions,
        })

        // Total
        totalData.unshift({
          date: periodDate,
          y: sumTransactions,
        })

        categories.unshift(name)
      }

      let periods = 0
      let periodsTotalIncome = 0
      for (const iterator of incomeData) {
        if (iterator.y !== 0) {
          periods = periods + 1
          periodsTotalIncome = periodsTotalIncome + iterator.y
        }
      }
      let periodsExpense = 0
      let periodsTotalExpense = 0
      for (const iterator of expenseData) {
        if (iterator.y !== 0) {
          periodsExpense = periodsExpense + 1
          periodsTotalExpense = periodsTotalExpense + iterator.y
        }
      }

      const fakeLineDate = expenseData.map(i => ({ date: i.date, y: periodsTotalIncome / periods || periodsTotalExpense / periodsExpense }))

      const data = {
        series: [{
          // Income
          zIndex: 3,
          visible: periodsTotalIncome > 0 && this.isShowIncome,
          type: this.chartType,
          name: this.$t('money.income'),
          color: 'var(--c-income-1)',
          data: incomeData,
          marker: {
            lineColor: 'var(--c-income-1)',
          },
        }, {
          // Expense
          zIndex: 2,
          visible: periodsTotalExpense > 0 && this.isShowExpense,
          type: this.chartType,
          name: this.$t('money.expense'),
          color: 'var(--c-expense-1)',
          data: expenseData,
          marker: {
            lineColor: 'var(--c-expense-1)',
          },
        }, {
          // Fake data to make good hover on bar chart
          zIndex: 1,
          visible: true,
          type: 'line',
          name: '',
          color: 'transparent',
          data: fakeLineDate,
          marker: {
            enabled: false,
            symbol: 'circle',
            radius: 0,
            lineWidth: 0,
            states: {
              hover: {
                fillColor: 'transparent',
                lineColor: 'transparent',
                lineWidth: 0,
              },
            },
          },
          dataLabels: {
            enabled: false,
          },
        }],
        categories,
        averageIncome: periodsTotalIncome / periods,
        averageExpense: periodsTotalExpense / periodsExpense,
      }

      const tooltip = this.$store.state.ui.pc ? { ...chartOptions.tooltip } : { enabled: false }

      const plotLines = []
      // Expense
      if (periodsTotalExpense > 0 && this.isShowExpense) {
        plotLines.push({
          opacity: 0.5,
          color: 'var(--c-expense-opacity)',
          value: data.averageExpense,
          width: '2',
          zIndex: 1,
        })
      }

      // Income
      if (periodsTotalIncome > 0 && this.isShowIncome) {
        plotLines.push({
          opacity: 0.5,
          color: 'var(--c-income-opacity)',
          value: data.averageIncome,
          width: '2',
          zIndex: 1,
        })
      }

      return {
        ...chartOptions,
        legend: false,
        tooltip,

        series: data.series,

        xAxis: {
          ...chartOptions.xAxis,
          categories: data.categories,
        },

        yAxis: {
          ...chartOptions.yAxis,
          plotLines,
        },

        chart: {
          ...chartOptions.chart,
          height: '180',
        },

        plotOptions: {
          ...chartOptions.plotOptions,
          series: {
            ...chartOptions.plotOptions.series,
            dataLabels: {
              ...chartOptions.plotOptions.series.dataLabels,
              enabled: this.isShowDataLabels,
            },
          },
        },
      }
    },
  },
})
</script>

<template lang="pug">
.chart(@click="onClickChart")
  Chart(
    :key="$route.fullPath"
    :options="chartData"
    :callback="chartCallback"
  )
</template>

<style lang="stylus" scoped>
.chart
  z-index 3
  position relative
</style>