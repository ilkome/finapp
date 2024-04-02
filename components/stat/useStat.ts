import dayjs from 'dayjs'
import type { CategoryId } from '~/components/categories/types'
import type { FilterProvider } from '~/components/filter/useFilter'
import type {
  MoneyTypeNumber,
  MoneyTypeSlug,
  MoneyTypeSlugSum,
} from '~/components/stat/types'
import type { TrnId, Trns } from '~/components/trns/types'
import { getTrnsIds } from '~/components/trns/getTrns'
import { moneyTypes } from '~/components/stat/types'
import { type TotalReturns, getTotal } from '~/components/amount/getTotal'
import { useAppNav } from '~/components/app/useAppNav'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export function useStat(filter: FilterProvider) {
  const appNavStore = useAppNav()
  const categoriesStore = useCategoriesStore()
  const currenciesStore = useCurrenciesStore()
  const trnsStore = useTrnsStore()
  const walletsStore = useWalletsStore()

  const trnsIds = computed(() => {
    const categoriesIds
      = filter.catsIds.value.length > 0
        ? categoriesStore.getTransactibleIds(filter.catsIds.value)
        : []
    const walletsIds
      = filter.walletsIds.value.length > 0 ? filter.walletsIds.value : []

    return getTrnsIds({
      categoriesIds,
      date: filter.date.value,
      periodName: filter.periodNameWithAll.value,
      trnsItems: trnsStore.items,
      walletsIds,
    })
  })

  const trnsItemsFiltered = computed(() => {
    const categoriesIds
      = filter.catsIds.value.length > 0
        ? categoriesStore.getTransactibleIds(filter.catsIds.value)
        : []
    const walletsIds
      = filter.walletsIds.value.length > 0 ? filter.walletsIds.value : []

    const trnsIds = getTrnsIds({
      categoriesIds,
      trnsItems: trnsStore.items,
      walletsIds,
    })

    return trnsIds.reduce((prev, trnId) => {
      prev[trnId] = trnsStore.items[trnId]
      return prev
    }, {} as Trns)
  })

  const combinedTrnsIds = computed(() => ({
    summary: trnsIds.value,
    income: trnsIds.value.filter(
      (id: TrnId) =>
        trnsStore.items[id].type === 1 || trnsStore.items[id].type === 2,
    ),
    expense: trnsIds.value.filter(
      (id: TrnId) =>
        trnsStore.items[id].type === 0 || trnsStore.items[id].type === 2,
    ),
  }))

  const avaDate = computed(
    () =>
      trnsItemsFiltered.value[Object.keys(trnsItemsFiltered.value).at(-1)].date,
  )

  const selectedPeriodCount = computed(() =>
    dayjs()
      .endOf(filter.periodNameWithoutAll.value)
      .diff(filter.date.value, filter.periodNameWithoutAll.value),
  )

  const filterPeriodMaxDateCount = computed(
    () =>
      dayjs()
        .endOf(filter.periodNameWithoutAll.value)
        .diff(avaDate.value, filter.periodNameWithoutAll.value) + 1,
  )

  const chartConfigShowedPeriodsCount = computed(
    () => filter.periods.value[filter.periodNameWithoutAll.value].showedPeriods,
  )

  const periodsToShow = computed(() =>
    selectedPeriodCount.value >= chartConfigShowedPeriodsCount.value
      ? selectedPeriodCount.value + 1
      : chartConfigShowedPeriodsCount.value > filterPeriodMaxDateCount.value
        ? filterPeriodMaxDateCount.value
        : chartConfigShowedPeriodsCount.value,
  )

  const statPrepareData = computed(() =>
    Array.from({ length: periodsToShow.value }).map((_, index) => {
      // const today = dayjs().startOf(filter.periodNameWithoutAll.value)
      // const lastPeriod = dayjs().subtract(periodsToShow.value, filter.periodNameWithoutAll.value).startOf(filter.periodNameWithoutAll.value)

      // console.log(dayjs(today).format(), dayjs(lastPeriod).format())
      // console.log('avaDate', dayjs(avaDate.value).format())

      const startDate = dayjs()

      // if (selectedPeriodCount.value >= chartConfigShowedPeriodsCount.value)
      //   startDate = dayjs().startOf(filter.periodNameWithoutAll.value).subtract(selectedPeriodCount.value, filter.periodNameWithoutAll.value)

      const date = dayjs(startDate)
        .startOf(filter.periodNameWithoutAll.value)
        .subtract(index, filter.periodNameWithoutAll.value)
        .valueOf()

      // TODO?: Get trnsIds from all periods first, then filter them
      const trnsIds = getTrnsIds({
        trnsItems: trnsStore.items,
        walletsIds: filter.walletsIds.value,
        categoriesIds: filter.transactibleCatsIds.value,
        periodName: filter.periodNameWithoutAll.value,
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
    }),
  )

  const statPrepareDataAverageAll = computed(() => {
    const totalPeriods = statPrepareData.value.reduce(
      (acc, cur) => {
        acc.incomeTransactions += cur.incomeTransactions
        acc.expenseTransactions += cur.expenseTransactions
        acc.sumTransactions += cur.sumTransactions
        return acc
      },
      {
        incomeTransactions: 0,
        expenseTransactions: 0,
        sumTransactions: 0,
      },
    )

    return Object.keys(totalPeriods).reduce((acc, prev) => {
      acc[prev] = totalPeriods[prev] / (periodsToShow.value - 1)
      return acc
    }, {} as TotalReturns)
  })

  function isShowGroupByType(type: MoneyTypeSlugSum) {
    const p1
      = (appNavStore.activeTabStat === 'summary'
      && statPrepareDataAverageAll.value[
        type === 'income' ? 'incomeTransactions' : 'expenseTransactions'
      ] > 0)
      || (appNavStore.activeTabStat === 'income' && type === 'income')
      || (appNavStore.activeTabStat === 'expense' && type === 'expense')

    const p2 = filter.periodNameWithAll.value === 'all'
    return p1 || p2
  }

  const statPrepareDataAverage = computed(() => {
    const totalPeriods = statPrepareData.value.slice(1).reduce(
      (acc, cur) => {
        acc.incomeTransactions += cur.incomeTransactions
        acc.expenseTransactions += cur.expenseTransactions
        acc.sumTransactions += cur.sumTransactions
        return acc
      },
      {
        incomeTransactions: 0,
        expenseTransactions: 0,
        sumTransactions: 0,
      },
    )

    return Object.keys(totalPeriods).reduce((acc, prev) => {
      acc[prev] = totalPeriods[prev] / (periodsToShow.value - 1)
      return acc
    }, {} as TotalReturns)
  })

  const statData = computed(() => ({
    series: [
      {
        data: statPrepareData.value.map(i => i.expenseTransactions),
        color: 'var(--c-expense-1)',
      },
      {
        data: statPrepareData.value.map(i => i.incomeTransactions),
        color: 'var(--c-income-1)',
      },
    ],
    categories: statPrepareData.value.map(i => i.date),
  }))

  const mTypes = {
    expense: 'expenseTransactions',
    income: 'incomeTransactions',
    sum: 'sumTransactions',
  } as const

  const trnsIdsInCategory = computed(() =>
    trnsIds.value.reduce(
      (prev, trnId) => {
        const categoryId = trnsStore.items[trnId]?.categoryId
        prev[categoryId] ??= []
        prev[categoryId].push(trnId)
        return prev
      },
      {} as Record<CategoryId, TrnId[]>,
    ),
  )

  interface TotalCategory {
    id: CategoryId
    value: number
  }

  interface TotalCategories {
    income: TotalCategory[]
    expense: TotalCategory[]
  }

  const totalCategoriesPrepare = computed(() => {
    return Object.keys(trnsIdsInCategory.value).reduce(
      (acc, categoryId) => {
        const totalInCategory = getTotal({
          baseCurrencyCode: currenciesStore.base,
          rates: currenciesStore.rates,
          trnsIds: trnsIdsInCategory.value[categoryId],
          trnsItems: trnsStore.items,
          walletsIds: filter.walletsIds.value,
          walletsItems: walletsStore.items,
        })
        acc[categoryId] = totalInCategory
        return acc
      },
      {} as Record<CategoryId, TotalReturns>,
    )
  })

  const totalCategories = computed(() => {
    // Object.keys(totalCategoriesPrepare.value).reduce(
    //   (acc, id) => {
    //     const totalInCategory = totalCategoriesPrepare.value[id]
    //     if (totalInCategory.incomeTransactions > 0)
    //       acc.income[id] = totalInCategory.incomeTransactions
    //     if (totalInCategory.expenseTransactions > 0)
    //       acc.expense[id] = totalInCategory.expenseTransactions

    //     return acc
    //   },
    //   {
    //     income: {},
    //     expense: {},
    //   } as {
    //     income: Record<CategoryId, number>
    //     expense: Record<CategoryId, number>
    //   },
    // )

    const categories = Object.keys(trnsIdsInCategory.value).reduce(
      (acc, categoryId) => {
        const totalInCategory = getTotal({
          baseCurrencyCode: currenciesStore.base,
          rates: currenciesStore.rates,
          trnsIds: trnsIdsInCategory.value[categoryId],
          trnsItems: trnsStore.items,
          walletsIds: filter.walletsIds.value,
          walletsItems: walletsStore.items,
        })
        if (totalInCategory.incomeTransactions > 0) {
          acc.income.push({
            id: categoryId,
            value: totalInCategory.incomeTransactions,
          })
        }

        if (totalInCategory.expenseTransactions > 0) {
          acc.expense.push({
            id: categoryId,
            value: totalInCategory.expenseTransactions,
          })
        }

        return acc
      },
      {
        income: [],
        expense: [],
      } as TotalCategories,
    )

    return Object.keys(categories).reduce(
      (prev, type) => {
        prev[type] = categories[type].sort((a, b) => b?.value - a?.value)
        return prev
      },
      {
        income: [],
        expense: [],
      } as TotalCategories,
    )
  })

  function getCategoriesStatBySlug(
    slug: MoneyTypeSlug,
  ): TotalCategories[MoneyTypeSlug] {
    return totalCategories.value[slug]
  }

  function getColorizeType(slug: MoneyTypeSlugSum): MoneyTypeSlug {
    return statPrepareData.value[selectedPeriodCount.value]?.[mTypes[slug]] > 0
      ? 'income'
      : 'expense'
  }

  function getMoneyTypeNumber(slug: MoneyTypeSlugSum): MoneyTypeNumber {
    return (
      moneyTypes.find(t => t.slug === `${slug}`.toLowerCase())?.type ?? 3
    )
  }

  function getAverageItem(slug: MoneyTypeSlugSum) {
    return {
      amount: statPrepareData.value[selectedPeriodCount.value]?.[mTypes[slug]],
      averageAmount: statPrepareDataAverage.value[mTypes[slug]],
      colorizeType: getColorizeType(slug),
      isShownAverage: statPrepareDataAverage.value.sumTransactions !== 0,
      moneyTypeNumber: getMoneyTypeNumber(slug),
      moneyTypeSlugSum: slug,
    }
  }

  const averages = computed(() => {
    // const averageSlugs = ['expense', 'income', 'sum'] as const
    const averageSlugs = ['sum', 'expense', 'income'] as const

    return averageSlugs.reduce(
      (acc, slug) => {
        acc[slug] = getAverageItem(slug)
        return acc
      },
      {} as Record<MoneyTypeSlugSum, ReturnType<typeof getAverageItem>>,
    )
  })

  const isToday = computed(() =>
    dayjs().isSame(filter.date.value, filter.nameWithoutAll.value),
  )
  const isLastPeriod = computed(() =>
    dayjs(filter.date.value).isSame(avaDate.value, filter.nameWithoutAll.value),
  )

  const filters = {
    filterPeriodMaxDateCount,
    avaDate,
    isToday,
    trnsIds,
    isLastPeriod,
  } as const

  // const categoriesHey = computed(() =>
  //   categoriesStore.favoriteCategoriesIds.map((id: CategoryId) => ({
  //     id,
  //     value:
  //       (totalCategories.value.income.find(c => c.id === id)?.value
  //       || totalCategories.value.expense.find(c => c.id === id)?.value)
  //       ?? 0,
  //   })),
  // )

  // const categoriesHey2 = computed(() =>
  //   categoriesStore.recentCategoriesIds.map((id: CategoryId) => ({
  //     id,
  //     value:
  //       (totalCategories.value.income.find(c => c.id === id)?.value
  //       || totalCategories.value.expense.find(c => c.id === id)?.value)
  //       ?? 0,
  //   })),
  // )

  return {
    // categoriesHey,
    // categoriesHey2,

    avaDate,
    averages,
    chartConfigShowedPeriodsCount,
    combinedTrnsIds,
    periodsToShow,
    filterPeriodMaxDateCount,
    getAverageItem,
    getCategoriesStatBySlug,
    getColorizeType,
    getMoneyTypeNumber,
    getTotal,
    isToday,
    isLastPeriod,
    statPrepareData,
    filters,
    statData,
    statPrepareDataAverageAll,
    isShowGroupByType,
    totalCategories,
    totalCategoriesPrepare,
  }
}

export type FiltersProvider = ReturnType<typeof useStat>
