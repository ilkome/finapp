<script setup lang="ts">
import dayjs from 'dayjs'
import defu from 'defu'
import { BarChart, LineChart } from 'echarts/charts'
import {
  GridComponent,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  TooltipComponent,
} from 'echarts/components'
import { use } from 'echarts/core'
import { SVGRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'
import { getTotal } from '~/components/amount/getTotal'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { config, lineConfig } from '~/components/stat/chart/config'
import { useChartStore } from '~/components/stat/chart/useChartStore'
import { markArea, setChartXAxis } from '~/components/stat/chart/utils'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import type { TrnId, TrnItem } from '~/components/trns/types'
import type { PeriodName } from '~/components/stat/chart/useChartStore'

const props = withDefaults(
  defineProps<{
    trnsIds: TrnId[]
    chartType?: 'bar' | 'line'
  }>(),
  {
    chartType: 'line',
    trnsIds: () => [],
  },
)

const periodWithoutAll = inject('periodWithoutAll') as Ref<PeriodName>
const date = inject('date') as Ref<number>
const setDate = inject('setDate') as (date: number) => void

use([
  BarChart,
  GridComponent,
  LineChart,
  SVGRenderer,
  MarkAreaComponent,
  MarkLineComponent,
  MarkPointComponent,
  TooltipComponent,
])

const chartStore = useChartStore()
const filterStore = useFilter()
const currenciesStore = useCurrenciesStore()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()

const chartRef = ref()

const trnsItems = computed(() =>
  props.trnsIds.reduce(
    (acc, id) => {
      const trn = trnsStore.items[id]
      acc[id] = trn
      return acc
    },
    {} as Record<TrnId, TrnItem>,
  ),
)

const statData = computed(() => {
  let periodsToShow
    = dayjs()
      .endOf(periodWithoutAll.value)
      .diff(trnsStore.oldestTrnDate, periodWithoutAll.value) + 1

  const periodsWantToShow
    = chartStore.periods[periodWithoutAll.value].showedPeriods
  periodsToShow
    = periodsWantToShow >= periodsToShow ? periodsToShow : periodsWantToShow

  const categories = []
  const incomeData = []
  const expenseData = []
  const totalData = []

  for (let index = 0; index < periodsToShow; index++) {
    // count total period
    const periodDate = dayjs()
      .startOf(periodWithoutAll.value)
      .subtract(index, periodWithoutAll.value)
      .valueOf()

    // TODO: move it to a separate function getFilterParams
    const categoriesIds
      = filterStore.catsIds.length > 0
        ? categoriesStore.getTransactibleIds(filterStore.catsIds)
        : false
    const walletsIds
      = filterStore.walletsIds.length > 0 ? filterStore.walletsIds : false

    const trnsIds = getTrnsIds({
      trnsItems: trnsItems.value,
      walletsIds,
      categoriesIds,
      periodName: periodWithoutAll.value,
      date: periodDate,
    })

    const { incomeTransactions, expenseTransactions, sumTransactions }
      = getTotal({
        baseCurrencyCode: currenciesStore.base,
        rates: currenciesStore.rates,
        trnsIds,
        trnsItems: trnsItems.value,
        walletsItems: walletsStore.items,
        transferCategoriesIds: categoriesStore.transferCategoriesIds,
      })

    // Income
    incomeData.push({
      date: periodDate,
      value: incomeTransactions,
    })

    // Expense
    expenseData.push({
      date: periodDate,
      value: expenseTransactions,
    })

    // Total
    totalData.push({
      date: periodDate,
      value: sumTransactions,
    })

    categories.push(
      `${dayjs()
        .startOf(periodWithoutAll.value)
        .subtract(index, periodWithoutAll.value)
        .valueOf()}`,
    )
  }

  let periods2 = 0

  // Income
  let periodsTotalIncome = 0
  for (const iterator of incomeData) {
    if (iterator.value !== 0) {
      periods2 = periods2 + 1
      periodsTotalIncome = periodsTotalIncome + iterator.value
    }
  }

  // Expense
  let periodsExpense = 0
  let periodsTotalExpense = 0
  for (const iterator of expenseData) {
    if (iterator.value !== 0) {
      periodsExpense = periodsExpense + 1
      periodsTotalExpense = periodsTotalExpense + iterator.value
    }
  }

  // Sum
  let periodsSum = 0
  let periodsTotalSum = 0
  for (const iterator of totalData) {
    if (iterator.value !== 0) {
      periodsSum = periodsSum + 1
      periodsTotalSum = periodsTotalSum + iterator.value
    }
  }

  const income = {
    data: incomeData,
    color: 'var(--c-income-1)',
  }

  const expense = {
    data: expenseData,
    color: 'var(--c-expense-1)',
  }

  const sum = {
    data: totalData,
    color: 'var(--c-font-2)',
  }

  // const series = [income, expense, sum]
  // const series = [income, expense, sum]
  const series = [income, expense]

  const data = {
    series: [
      {
        // Income
        zIndex: 3,
        visible: periodsTotalIncome > 0 && true,
        type: 'line',
        name: 'money.income',
        color: 'var(--c-income-1)',
        data: incomeData,
        marker: {
          lineColor: 'var(--c-income-1)',
        },
      },
      {
        // Expense
        zIndex: 2,
        visible: periodsTotalExpense > 0 && true,
        type: 'line',
        name: 'money.expense',
        color: 'var(--c-expense-1)',
        data: expenseData,
        marker: {
          lineColor: 'var(--c-expense-1)',
        },
      },
      {
        // Sum
        zIndex: 3,
        visible: periodsTotalIncome > 0 && periodsTotalExpense > 0 && true,
        type: 'line',
        name: 'money.sum',
        color: 'var(--c-font-2)',
        data: totalData,
        marker: {
          lineColor: 'var(--c-font-2)',
        },
      },
    ],
    categories,
    averageIncome: periodsTotalIncome / periods2,
    averageExpense: periodsTotalExpense / periodsExpense,
    averageSum: periodsTotalExpense / periodsExpense,
  }

  const plotLines = []

  // Expense
  if (periodsTotalExpense > 0 && true) {
    plotLines.unshift({
      opacity: 0.5,
      color: 'var(--c-expense-opacity)',
      value: data.averageExpense,
      width: '2',
      zIndex: 1,
    })
  }

  // Income
  if (periodsTotalIncome > 0 && true) {
    plotLines.unshift({
      opacity: 0.5,
      color: 'var(--c-income-opacity)',
      value: data.averageIncome,
      width: '2',
      zIndex: 1,
    })
  }

  // Sum
  if (periodsTotalSum > 0 && true) {
    plotLines.unshift({
      opacity: 0.5,
      color: 'var(--c-font-4)',
      value: data.averageSum,
      width: '2',
      zIndex: 1,
    })
  }

  return {
    data,
    series,
    categories,
    income,
    expense,
    sum,
    plotLines,
  }
})

const markedArea = ref(statData.value.categories.find(i => i === `${date.value}`))

function getFormat() {
  let format = 'MM'
  if (periodWithoutAll.value === 'day')
    format = 'D.MM'
  if (periodWithoutAll.value === 'week')
    format = 'D MMM'
  if (periodWithoutAll.value === 'month')
    format = 'MMM'
  if (periodWithoutAll.value === 'year')
    format = 'YYYY'

  return format
}

function getChartData() {
  const data = defu(config, {
    xAxis: setChartXAxis(statData.value.categories),
    series: setChartSeries(statData.value.series),
  })

  data.xAxis.axisLabel.formatter = (date: string) => {
    return dayjs(date).format(getFormat())
  }
  data.xAxis.axisPointer.label.formatter = ({ value } = { value: string }) => {
    return dayjs(value).format()
  }

  // INFO: Marked area works only with bar chart
  if (props.chartType !== 'bar') {
    data.series.push({
      data: [],
      type: 'bar',
      markArea: markArea(markedArea.value),
    })
  }
  else {
    data.series[0].markArea = markArea(markedArea.value)
  }

  return data
}

async function onClickChart(params: { offsetX: number, offsetY: number }) {
  const [point] = chartRef.value.convertFromPixel('grid', [
    params.offsetX,
    params.offsetY,
  ])
  setDate(statData.value.series[0].data[point].date)
  markedArea.value = statData.value.categories[point]
}

function setChartSeries(series: unknown[]) {
  return series.map((item: any) => ({
    ...defu(lineConfig, item),
    type: props.chartType,
    label: {
      ...lineConfig.label,
      show: chartStore.isShowDataLabels,
    },
  }))
}
</script>

<template>
  <VChart
    ref="chartRef"
    :option="getChartData()"
    autoresize
    @zr:click="onClickChart"
  />
</template>
~/components/stat/chart/config~/components/stat/chart/utils
