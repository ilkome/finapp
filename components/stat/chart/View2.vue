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
import {
  getTransactibleCategoriesIds,
  getTransferCategoriesIds,
} from '~/components/categories/getCategories'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { config, lineConfig } from '~/components/chart/config'
import { useChart } from '~/components/chart/useChart'
import { markArea, setChartXAxis } from '~/components/chart/utils'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'
import { getTrnsIds } from '~/components/trns/getTrns'
import { getOldestTrnDate } from '~/components/trns/helpers'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import type { TrnId, TrnItem } from '~/components/trns/types'
import type { PeriodName } from '~/components/chart/useChart'

const props = withDefaults(
  defineProps<{
    trnsIds: TrnId[]
    periodWithoutAll: PeriodName
    chartType?: 'bar' | 'line'
  }>(),
  {
    chartType: 'line',
    trnsIds: () => [],
  },
)

const emit = defineEmits<{
  (e: 'setDate', value: number): void
}>()

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

const { isShowDataLabels } = useChart()
const filterStore = useFilter()
const currenciesStore = useCurrenciesStore()
const walletsStore = useWalletsStore()
const categoriesStore = useCategoriesStore()
const trnsStore = useTrnsStore()
const { periods } = useChart()

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
  const categoriesItems = categoriesStore.items
  const walletsItems = walletsStore.items
  const baseCurrencyCode = currenciesStore.base
  const rates = currenciesStore.rates
  const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)

  // Diff periods from oldest trn and today
  const oldestTrnDate = getOldestTrnDate(trnsItems.value)
  let periodsToShow
    = dayjs()
      .endOf(props.periodWithoutAll)
      .diff(oldestTrnDate, props.periodWithoutAll) + 1
  const periodsWantToShow = periods.value[props.periodWithoutAll].showedPeriods
  periodsToShow
    = periodsWantToShow >= periodsToShow ? periodsToShow : periodsWantToShow

  const categories = []
  const incomeData = []
  const expenseData = []
  const totalData = []

  for (let index = 0; index < periodsToShow; index++) {
    // count total period
    const periodDate = dayjs()
      .startOf(props.periodWithoutAll)
      .subtract(index, props.periodWithoutAll)
      .valueOf()

    // TODO: move it to a separate function getFilterParams
    const categoriesIds
      = filterStore.catsIds.length > 0
        ? getTransactibleCategoriesIds(filterStore.catsIds, categoriesItems)
        : false
    const walletsIds
      = filterStore.walletsIds.length > 0 ? filterStore.walletsIds : false

    const trnsIds = getTrnsIds({
      trnsItems: trnsItems.value,
      walletsIds,
      categoriesIds,
      periodName: props.periodWithoutAll,
      date: periodDate,
    })

    const { incomeTransactions, expenseTransactions, sumTransactions }
      = getTotal({
        baseCurrencyCode,
        rates,
        trnsIds,
        trnsItems: trnsItems.value,
        walletsItems,
        transferCategoriesIds,
      })

    let format = 'MM'
    if (props.periodWithoutAll === 'day')
      format = 'D.MM'
    if (props.periodWithoutAll === 'week')
      format = 'D MMM'
    if (props.periodWithoutAll === 'month')
      format = 'MMM'
    if (props.periodWithoutAll === 'year')
      format = 'YYYY'

    const name = dayjs()
      .startOf(props.periodWithoutAll)
      .subtract(index, props.periodWithoutAll)
      .format(format)

    // Income
    incomeData.unshift({
      date: periodDate,
      value: incomeTransactions,
    })

    // Expense
    expenseData.unshift({
      date: periodDate,
      value: expenseTransactions,
    })

    // Total
    totalData.unshift({
      date: periodDate,
      value: sumTransactions,
    })

    categories.unshift(name)
  }

  let periods2 = 0

  // Income
  let periodsTotalIncome = 0
  for (const iterator of incomeData) {
    if (iterator.y !== 0) {
      periods2 = periods2 + 1
      periodsTotalIncome = periodsTotalIncome + iterator.y
    }
  }

  // Expense
  let periodsExpense = 0
  let periodsTotalExpense = 0
  for (const iterator of expenseData) {
    if (iterator.y !== 0) {
      periodsExpense = periodsExpense + 1
      periodsTotalExpense = periodsTotalExpense + iterator.y
    }
  }

  // Sum
  let periodsSum = 0
  let periodsTotalSum = 0
  for (const iterator of totalData) {
    if (iterator.y !== 0) {
      periodsSum = periodsSum + 1
      periodsTotalSum = periodsTotalSum + iterator.y
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
    plotLines.push({
      opacity: 0.5,
      color: 'var(--c-expense-opacity)',
      value: data.averageExpense,
      width: '2',
      zIndex: 1,
    })
  }

  // Income
  if (periodsTotalIncome > 0 && true) {
    plotLines.push({
      opacity: 0.5,
      color: 'var(--c-income-opacity)',
      value: data.averageIncome,
      width: '2',
      zIndex: 1,
    })
  }

  // Sum
  if (periodsTotalSum > 0 && true) {
    plotLines.push({
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

// TODO: computed, when date change outside this component
const markedArea = ref(statData.value.categories.at(-1))

function getChartData() {
  const data = defu(config, {
    xAxis: setChartXAxis(statData.value.categories),
    series: setChartSeries(statData.value.series),
  })

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
  emit('setDate', statData.value.series[0].data[point].date)
  markedArea.value = statData.value.categories[point]
}

function setChartSeries(series: unknown[]) {
  return series.map((item: any) => ({
    ...defu(lineConfig, item),
    type: props.chartType,
    label: {
      ...lineConfig.label,
      show: isShowDataLabels.value,
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
