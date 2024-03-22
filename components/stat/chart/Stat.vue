<script setup lang="ts">
import dayjs from 'dayjs'
import { moneyTypes } from '~/components/stat/types'
import type { MoneyTypeNumber, MoneyTypeSlug, MoneyTypeSlugSum } from '~/components/stat/types'
import type { CategoryId } from '~/components/categories/types'
import type { PeriodName, PeriodNameWithAll } from '~/components/stat/chart/useChartStore'
import type { TrnId, TrnItem } from '~/components/trns/types'
import type { WalletId } from '~/components/wallets/types'
import { useFilter } from '~/components/filter/useFilter'
import { useStat } from '~/components/stat/useStatStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { getTotal } from '~/components/amount/getTotal'
import type { TotalReturns } from '~/components/amount/getTotal'
import { useChartStore } from '~/components/stat/chart/useChartStore'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  categoriesIds?: CategoryId[]
  walletsIds?: WalletId[]
}>()

const categoriesStore = useCategoriesStore()
const chartStore = useChartStore()
const currenciesStore = useCurrenciesStore()
const filterStore = useFilter()
const statStore = useStat()
const trnsStore = useTrnsStore()
const walletsStore = useWalletsStore()

const mTypes = {
  expense: 'expenseTransactions',
  income: 'incomeTransactions',
  sum: 'sumTransactions',
} as const

const selectedPeriodCount = computed(() =>
  dayjs()
    .endOf(filterStore.periodWithoutAll)
    .diff(filterStore.date, filterStore.periodWithoutAll),
)

const periodsToShow = computed(() => {
  const chartConfigShowedPeriodsCount
    = chartStore.periods[filterStore.periodWithoutAll].showedPeriods

  const filterPeriodMaxDateCount = dayjs()
    .endOf(filterStore.periodWithoutAll)
    .diff(trnsStore.oldestTrnDate, filterStore.periodWithoutAll)

  return selectedPeriodCount.value > chartConfigShowedPeriodsCount
    ? selectedPeriodCount.value
    : chartConfigShowedPeriodsCount > filterPeriodMaxDateCount
      ? filterPeriodMaxDateCount
      : chartConfigShowedPeriodsCount
})

const statPrepareData = computed(() => {
  const periodsWithData = Array.from({ length: periodsToShow.value }).map(
    (_, index) => {
      const date = dayjs()
        .startOf(filterStore.periodWithoutAll)
        .subtract(index, filterStore.periodWithoutAll)
        .valueOf()

      // TODO: Get trnsIds from all periods first, then filter them
      const trnsIds = getTrnsIds({
        trnsItems: trnsStore.items,
        walletsIds: filterStore.walletsIds,
        categoriesIds: filterStore.transactibleCatsIds,
        periodName: filterStore.periodWithoutAll,
        date,
      })

      const total = getTotal({
        baseCurrencyCode: currenciesStore.base,
        rates: currenciesStore.rates,
        trnsIds,
        trnsItems: trnsStore.items,
        walletsItems: walletsStore.items,
        transferCategoriesIds: categoriesStore.transferCategoriesIds,
      })

      return { date, ...total, trnsIds }
    },
  )

  return periodsWithData
})

const statPrepareDataAverage = computed(() => {
  const fromDate = dayjs()
    .startOf(filterStore.periodWithoutAll)
    .subtract(periodsToShow.value - 1, filterStore.periodWithoutAll)
    .valueOf()

  const untilDate = dayjs()
    .startOf(filterStore.periodWithoutAll)
    .valueOf()

  // TODO: Get trnsIds from all periods first, then filter them
  const trnsIds = getTrnsIds({
    trnsItems: trnsStore.items,
    walletsIds: filterStore.walletsIds,
    categoriesIds: filterStore.transactibleCatsIds,
    periodName: filterStore.periodWithoutAll,
    fromDate,
    untilDate,
  })

  const total = getTotal({
    baseCurrencyCode: currenciesStore.base,
    rates: currenciesStore.rates,
    trnsIds,
    trnsItems: trnsStore.items,
    walletsItems: walletsStore.items,
    transferCategoriesIds: categoriesStore.transferCategoriesIds,
  })

  const totalAverage = Object.keys(total).reduce((acc, prev) => {
    acc[prev] = total[prev] / (periodsToShow.value - 1)
    return acc
  }, {} as TotalReturns)

  return {
    ...totalAverage,
    trnsIds,
  }
})

function getBiggestAmount(slug: MoneyTypeSlug) {
  return statStore.statCurrentPeriod[slug].biggest
}

const trnsIds = computed(() =>
  trnsStore.getStoreTrnsIds({
    categoriesIds: props.categoriesIds,
    walletsIds: props.walletsIds,
  }),
)

const trnsIdsInCategory = computed(() => trnsIds.value.reduce(
  (prev, trnId) => {
    const categoryId = trnsStore.items[trnId]?.categoryId
    prev[categoryId] ??= []
    prev[categoryId].push(trnId)
    return prev
  },
  {} as Record<CategoryId, TrnId[]>,
))

const categoriesTotal = computed(() => {
  const income = {}
  const expense = {}

  for (const categoryId in trnsIdsInCategory.value) {
    const totalInCategory = getTotal({
      baseCurrencyCode: currenciesStore.base,
      rates: currenciesStore.rates,
      trnsIds: trnsIdsInCategory.value[categoryId],
      trnsItems: trnsStore.items,
      walletsIds: filterStore.walletsIds,
      walletsItems: walletsStore.items,
    })

    if (totalInCategory.incomeTransactions > 0)
      income[categoryId] = totalInCategory.incomeTransactions

    if (totalInCategory.expenseTransactions > 0)
      expense[categoryId] = totalInCategory.expenseTransactions
  }

  return {
    income,
    expense,
  }
})

function getCategoriesIds(slug: MoneyTypeSlug): CategoryId[] {
  return Object.keys(categoriesTotal.value[slug])
}

function getColorizeType(slug: MoneyTypeSlugSum) {
  return statPrepareData.value[selectedPeriodCount.value][mTypes[slug]] > 0
    ? 'income'
    : 'expense'
}

function getMoneyTypeNumber(slug: MoneyTypeSlugSum): MoneyTypeNumber {
  return moneyTypes.find(t => t.slug === `${slug}`.toLowerCase())?.type ?? 3
}

function getAverageItem(slug: MoneyTypeSlugSum) {
  return {
    amount: statPrepareData.value[selectedPeriodCount.value][mTypes[slug]],
    averageAmount: statPrepareDataAverage.value[mTypes[slug]],
    colorizeType: getColorizeType(slug),
    isShownAverage: statPrepareDataAverage.value.sumTransactions !== 0,
    moneyTypeNumber: getMoneyTypeNumber(slug),
    moneyTypeSlugSum: slug,
  }
}

const averages = computed(() => {
  const averageSlugs = ['income', 'expense', 'sum'] as const

  return averageSlugs.reduce((acc, slug) => {
    acc[slug] = getAverageItem(slug)
    return acc
  }, {} as Record<MoneyTypeSlugSum, ReturnType<typeof getAverageItem>>)
})

function usePeriodDate(trnsIds: Ref<TrnId[]>) {
  const { getNextPeriodDate, getPrevPeriodDate } = usePeriodUtils()

  const date = ref<number>(
    dayjs(filterStore.date).startOf(filterStore.periodWithoutAll).valueOf(),
  )

  function setDate(value: number) {
    date.value = value
  }

  const period = ref<PeriodNameWithAll>(filterStore.period)
  const periodWithoutAll = computed<PeriodName>(() =>
    period.value === 'all' ? 'year' : period.value,
  )

  function setPeriodAndDate(periodName: PeriodNameWithAll) {
    if (periodName !== 'all')
      date.value = dayjs().startOf(periodName).valueOf()

    period.value = periodName
  }

  function setNextPeriodDate() {
    const newDate = getNextPeriodDate({
      date: date.value,
      period: period.value,
      trnsIds: trnsIds.value,
    })
    if (newDate)
      date.value = newDate
  }

  function setPrevPeriodDate() {
    const newDate = getPrevPeriodDate({
      date: date.value,
      period: period.value,
      trnsIds: trnsIds.value,
    })
    if (newDate)
      date.value = newDate
  }

  return {
    date,
    setDate,
    setPeriodAndDate,
    setNextPeriodDate,
    setPrevPeriodDate,

    period,
    periodWithoutAll,
  }
}

const {
  date,
  period,
  setDate,
  periodWithoutAll,
  setPeriodAndDate,
  setPrevPeriodDate,
  setNextPeriodDate,
} = usePeriodDate(trnsIds)

const periodTrnsIds = computed(() =>
  trnsStore.getStoreTrnsIds({
    date: date.value,
    periodName: period.value,
    categoriesIds: props.categoriesIds,
    walletsIds: props.walletsIds,
  }),
)

provide('date', date)
provide('period', period)
provide('periodWithoutAll', periodWithoutAll)
provide('setNextPeriodDate', setNextPeriodDate)
provide('setPeriodAndDate', setPeriodAndDate)
provide('setPrevPeriodDate', setPrevPeriodDate)
provide('setDate', setDate)

function usePeriodUtils() {
  function getNextPeriodDate({
    date,
    period,
    trnsIds,
  }: {
    date: number
    period: PeriodNameWithAll
    trnsIds: TrnId[]
  }) {
    if (period === 'all' || trnsIds.length === 0)
      return

    const oldestTrn: TrnItem = trnsStore.items[trnsIds.at(-1) as TrnId]
    if (!oldestTrn)
      return

    const oldestDate = dayjs(oldestTrn.date).startOf(period).valueOf()

    const nextDate = dayjs(date).subtract(1, period).startOf(period).valueOf()

    if (nextDate >= oldestDate)
      return nextDate
  }

  function getPrevPeriodDate({
    date,
    period,
    trnsIds,
  }: {
    date: number
    period: PeriodNameWithAll
    trnsIds: TrnId[]
  }) {
    if (period === 'all' || trnsIds.length === 0)
      return

    const nextDate = dayjs(date).add(1, period).startOf(period).valueOf()

    if (nextDate <= dayjs().valueOf())
      return nextDate
  }

  return {
    getNextPeriodDate,
    getPrevPeriodDate,
  }
}
</script>

<template>
  <div class="flex items-center justify-between gap-2 px-2">
    <StatDateNav />
    <StatDateView />
    <CurrenciesChangeBtn />
  </div>

  <!-- Sum All -->
  <div class="mx-2 mb-2 rounded-xl bg-item-4">
    <div
      class="flex flex-wrap items-center gap-3 gap-x-6 rounded-lg bg-item-4 p-2 sm_justify-start sm_bg-transparent sm_p-3 sm_pt-4"
    >
      <StatTotalWithAverage2
        v-for="(item, slug) in averages"
        :key="slug"
        :item="item"
      />
    </div>

    <LazyStatChartWrap
      :trnsIds
    />
  </div>

  <div class="px-2">
    <div class="pb-4">
      <UiTitle>
        <div class="flex gap-2">
          Всего транзакций: {{ trnsIds?.length }}
        </div>
      </UiTitle>
    </div>

    <TrnsListWithControl :trnsIds="periodTrnsIds" />
  </div>
</template>
