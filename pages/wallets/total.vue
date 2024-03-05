<script setup lang="ts">
import defu from 'defu'
import dayjs from 'dayjs'
import type { PeriodsNamesExceptAll } from '~/components/date/types'
import type { TrnId, TrnItem } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { averageLine, baseSeriesItemStyle, options } from '~/components/chart/chartOprions'
import { getTransferCategoriesIds } from '~/components/categories/getCategories'
import { getTotal } from '~/components/amount/getTotal'
import { getTrnsIds } from '~/components/trns/getTrns'
import { getOldestTrnDate } from '~/components/trns/helpers'
import { formatAmount, getCurrencySymbol } from '~/components/amount/formatAmount'
import { getMaxPeriodsToShow } from '~/components/date/helpers'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

type DateValueOf = number

const { baseCurrencyCode } = useAmount()
const currenciesStore = useCurrenciesStore()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()

/**
 * Transactions
 */
const trnsItems = computed<Record<TrnId, TrnItem>>(() => trnsStore.items)
const oldestTrnDate = getOldestTrnDate(trnsItems.value)

/**
 * Config
 */
const activePeriod = ref<PeriodsNamesExceptAll>('month')

/**
 * Periods
 */
const periods: PeriodsNamesExceptAll[] = ['day', 'week', 'month', 'year']
const maxPeriodsNumber = computed(() => getMaxPeriodsToShow(activePeriod.value, oldestTrnDate))

/**
 * Get Period date from until
 */
function getPeriodDates({ date, period }: { date: DateValueOf; period: PeriodsNamesExceptAll }) {
  return {
    from: dayjs(date).startOf(period).valueOf(),
    until: dayjs(date).endOf(period).valueOf(),
  }
}

function getLastDateOrToday({ date }: { date: DateValueOf }) {
  const today = dayjs().endOf('day').valueOf()
  if (date > today)
    return today

  return date
}

function getPeriodsDates({ fromDate, periodName, periodsCount }: {
  fromDate: DateValueOf
  periodName: PeriodsNamesExceptAll
  periodsCount: number
}) {
  const periods = []

  // TODO: new Array map
  for (let index = 0; index < periodsCount; index++) {
    periods.push({
      date: dayjs(fromDate).startOf(periodName).add(index, periodName).startOf(periodName).format(),
    })
  }

  return periods
}

const periodsGenerated = computed(() => getPeriodsDates({
  fromDate: oldestTrnDate,
  periodName: activePeriod.value,
  periodsCount: maxPeriodsNumber.value,
}))

const series = computed(() => periodsGenerated.value.map((period) => {
  const periodDates = getPeriodDates({ date: period.date, period: activePeriod.value })
  const trnsIds = getTrnsIds({
    fromDate: periodDates.from,
    untilDate: periodDates.until,
    trnsItems: trnsItems.value,
  })

  const categoriesItems = categoriesStore.items
  const walletsItems = walletsStore.items
  const baseCurrencyCode = currenciesStore.base
  const rates = currenciesStore.rates
  const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)
  const total = getTotal({
    baseCurrencyCode,
    rates,
    transferCategoriesIds,
    trnsIds,
    trnsItems: trnsItems.value,
    walletsItems,
  })

  return {
    date: period.date,
    trnsIds,
    total,
  }
}))

const seriesTotal = computed(() => {
  const t = []
  for (const [idx, element] of series.value.entries()) {
    const sum = element.total.sumTransfers + element.total.sumTransactions
    idx === 0
      ? t.push(sum)
      : t.push(t[idx - 1] + sum)
  }

  return t
})

/**
 * Chart options
 */
const chartConfig = computed(() => ({
  xAxis: {
    type: 'category',
    data: series.value.map(period => dayjs(period.date).format('DD MMMM')),
  },

  series: [{
    name: 'Income',
    type: 'bar',
    data: series.value.map(period => period.total.incomeTransactions),
    markLine: averageLine,
    itemStyle: {
      ...baseSeriesItemStyle,
      color: 'green',
    },
  }, {
    name: 'Expense',
    type: 'bar',
    data: series.value.map(period => period.total.expenseTransactions),
    markLine: averageLine,
    itemStyle: {
      ...baseSeriesItemStyle,
      color: 'red',
    },
  }, {
    name: 'Total',
    type: 'line',
    data: seriesTotal.value,
    markLine: averageLine,
    itemStyle: {
      ...baseSeriesItemStyle,
      color: '#c1c1c1',
    },
  }],

  tooltip: {
    valueFormatter: value => `${formatAmount(value)} ${getCurrencySymbol(baseCurrencyCode.value)}`,
  },

  dataZoom: [{
    type: 'inside',
    start: 0,
    end: 100,
  }, {
    start: 0,
    end: 0,
  }],

  legend: {},

  grid: {
    bottom: '50',
  },
}))

/**
 * Chart data
 */
const chartData = computed(() => defu(JSON.parse(JSON.stringify(options)), chartConfig.value))
</script>

<template lang="pug">
.h-full.overflow-hidden.overflow-y-auto
  .my-5
    h1.pb-2 Periods

    //- UiTabs
    //-   UiTabsItem(
    //-     v-for="date in periods"
    //-     :key="date"
    //-     :isActive="activePeriod === date"
    //-     @click="activePeriod = date"
    //-   ) {{ date }}

  .my-5
    h1 date
    pre {{ dayjs(date).format('YYYY-MM-DD HH:mm') }}

  .my-5
    h1 oldestTrnDate
    pre {{ dayjs(oldestTrnDate).format('YYYY-MM-DD HH:mm') }}

  .my-5
    h1 maxPeriodsNumber
    pre {{ maxPeriodsNumber }}

  .my-6.mx-2.py-2.rounded-lg.bg-item-4.border.dark_border-neutral-800
    ChartBase.h-80(
      @finished="finished"
      :option="chartData"
    )
</template>
