<script setup lang="ts">
import _merge from 'lodash.merge'
import _minby from 'lodash.minby'
import _sortby from 'lodash.sortby'
import dayjs from 'dayjs'
import type { ComputedRef, Ref } from '@vue/composition-api'
import type { PeriodsNamesExeptAll } from '~/components/date/types'
import type { TrnID, TrnItem } from '~/components/trns/types'
import useAmount from '~/components/amount/useAmount'
import { averageLine, baseSeriesItemStyle, options } from '~/components/chart/chartOprions'
import { getTransferCatgoriesIds } from '~/components/categories/getCategories'
import { getTotal } from '~/components/trns/getTotal'
import { getTrnsIds } from '~/components/trns/getTrns'

type DateValueOf = number

const { baseCurrency, formatAmount, getCurrencySymbol } = useAmount()
const { $store } = useNuxtApp()

/**
 * Get oldest TrnItem
 */
function getOldestTrnDate(trnsItems: Record<TrnID, TrnItem>): DateValueOf {
  const startOfToday = dayjs().startOf('day').valueOf()
  return _minby(Object.values(trnsItems), 'date')?.date || startOfToday
}

/**
 * Get max periods to show
 */
function getMaxPeriodsToShow({ periodName, fromDate }: { periodName: PeriodsNamesExeptAll; fromDate: DateValueOf }) {
  return dayjs().endOf(periodName).diff(fromDate, periodName) + 1
}

/**
 * Transactions
 */
const trnsItems: ComputedRef<Record<TrnID, TrnItem>> = computed(() => $store.state.trns.items)
const trnsIds: ComputedRef<TrnID[]> = computed(() => Object.keys(trnsItems.value))
const oldestTrnDate = getOldestTrnDate(trnsItems.value)

/**
 * Config
 */
const activePeriod: Ref<PeriodsNamesExeptAll> = ref('week')

/**
 * Periods
 */
const periods: PeriodsNamesExeptAll[] = ['day', 'week', 'month', 'year']
const maxPeriodsNumber = computed(() => getMaxPeriodsToShow({ periodName: activePeriod.value, fromDate: oldestTrnDate }))

/**
 * Get Period date from until
 */
function getPeriodDates({ date, period }: { date: DateValueOf; period: PeriodsNamesExeptAll }) {
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
  periodName: PeriodsNamesExeptAll
  periodsCount: number
}) {
  const periods = []

  for (let index = 0; index < periodsCount; index++) {
    periods.push({
      date: dayjs(fromDate).startOf(periodName).add(index, periodName).startOf(periodName).format(),
    })
  }

  return periods
}

const periodshey = computed(() => getPeriodsDates({
  fromDate: oldestTrnDate,
  periodName: activePeriod.value,
  periodsCount: maxPeriodsNumber.value,
}))

const series = computed(() => periodshey.value.map((period) => {
  const periodDates = getPeriodDates({ date: period.date, period: activePeriod.value })
  const trnsIds = getTrnsIds({
    fromDate: periodDates.from,
    untilDate: periodDates.until,
    trnsItems: trnsItems.value,
  })

  const categoriesItems = $store.state.categories.items
  const walletsItems = $store.state.wallets.items
  const baseRate = $store.state.currencies.base
  const rates = $store.state.currencies.rates
  const transferCategoriesIds = getTransferCatgoriesIds(categoriesItems)
  const total = getTotal({
    baseRate,
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
    idx > 0
      ? t.push(t[idx - 1] + sum)
      : t.push(sum)
  }

  return t
})

/**
 * Chart oprions
 */
const chartOptions = computed(() => ({
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
    valueFormatter: value => `${formatAmount(value)} ${getCurrencySymbol(baseCurrency.value)}`,
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
}))

/**
 * Chart data
 */
const chartData = computed(() => _merge(JSON.parse(JSON.stringify(options)), chartOptions.value))
</script>

<template lang="pug">
.h-full.overflow-hidden.overflow-y-auto
  h1 periods
  .flex
    div.px-2(
      v-for="date in periods"
      :key="date"
      @click="activePeriod = date"
    ) {{ date }}

  h1 series
  //- pre {{ series }}

  h1(@click="loading = !loading") loading {{ loading }}
  //- pre {{ series }}

  h1 seriesTotal
  //- pre {{ seriesTotal }}

  h1 storeFilter
  //- pre {{ storeFilter }}

  h1 date
  pre {{ dayjs(date).format('YYYY-MM-DD HH:mm') }}

  h1 activePeriod
  pre {{ activePeriod }}

  h1 oldestTrnDate
  pre {{ dayjs(oldestTrnDate).format('YYYY-MM-DD HH:mm') }}

  h1 maxPeriodsNumber
  pre {{ maxPeriodsNumber }}

  .my-6.mx-2.py-2.rounded-lg.bg-skin-item-main-bg.border.dark_border-neutral-800
    ChartBase.h-80(
      @finished="finished"
      :option="chartData"
    )

  .my-6.mx-2
    h1 {{ trnsIds.length }}

    h1 chartOptions.xAxis
    //- pre {{ chartOptions }}

    TrnsHistory(
      :trnsIds="trnsIds"
    )
</template>
