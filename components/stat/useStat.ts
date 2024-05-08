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
import { getDates } from '~/components/date/format'

export function useStat(filter: FilterProvider) {
  const appNavStore = useAppNav()
  const categoriesStore = useCategoriesStore()
  const currenciesStore = useCurrenciesStore()
  const trnsStore = useTrnsStore()
  const walletsStore = useWalletsStore()

  function getTrnsIdsWithFilter() {
    const categoriesIds
      = filter.catsIds.value.length > 0
        ? categoriesStore.getTransactibleIds(filter.catsIds.value)
        : []
    const walletsIds
      = filter.walletsIds.value.length > 0 ? filter.walletsIds.value : []

    return getTrnsIds({
      categoriesIds,
      dates: getDates(filter.periodNameWithAll.value, filter.date.value),
      trnsItems: trnsStore.items,
      walletsIds,
    })
  }

  function getTrnsIdsWithFilterNoDates() {
    const categoriesIds
      = filter.catsIds.value.length > 0
        ? categoriesStore.getTransactibleIds(filter.catsIds.value)
        : []
    const walletsIds
      = filter.walletsIds.value.length > 0 ? filter.walletsIds.value : []

    return getTrnsIds({
      categoriesIds,
      trnsItems: trnsStore.items,
      walletsIds,
    })
  }

  const trnsIds = computed(() => getTrnsIdsWithFilter())

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

  const avaDate = computed(
    () =>
      trnsItemsFiltered.value[Object.keys(trnsItemsFiltered.value)?.at(-1)]?.date,
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

  function getStatDataPrepared(categoryId: CategoryId) {
    return Array.from({ length: periodsToShow.value }).map((_, index) => {
      const startDate = dayjs()

      const date = dayjs(startDate)
        .startOf(filter.periodNameWithoutAll.value)
        .subtract(index, filter.periodNameWithoutAll.value)
        .valueOf()

      // TODO?: Get trnsIds from all periods first, then filter them
      const trnsIds = getTrnsIds({
        categoriesIds: [categoryId],
        dates: getDates(filter.periodNameWithAll.value, date),
        trnsItems: trnsStore.items,
        walletsIds: filter.walletsIds.value,
      })

      const total = getTotal({
        baseCurrencyCode: currenciesStore.base,
        rates: currenciesStore.rates,
        transferCategoriesIds: categoriesStore.transferCategoriesIds,
        trnsIds,
        trnsItems: trnsStore.items,
        walletsItems: walletsStore.items,
      })

      return {
        date,
        ...total,
        expense: total.expense,
        income: total.income,
        sum: total.sum,
        summary: total.sum,
        trnsIds,
      }
    }).reverse()
  }

  const statPrepareData = computed(() =>
    Array.from({ length: periodsToShow.value }).map((_, index) => {
      const startDate = dayjs()

      const date = dayjs(startDate)
        .startOf(filter.periodNameWithoutAll.value)
        .subtract(index, filter.periodNameWithoutAll.value)
        .valueOf()

      // TODO?: Get trnsIds from all periods first, then filter them
      const trnsIds = getTrnsIds({
        categoriesIds: filter.transactibleCatsIds.value,
        dates: getDates(filter.periodNameWithAll.value, date),
        trnsItems: trnsStore.items,
        walletsIds: filter.walletsIds.value,
      })

      const total = getTotal({
        baseCurrencyCode: currenciesStore.base,
        rates: currenciesStore.rates,
        transferCategoriesIds: categoriesStore.transferCategoriesIds,
        trnsIds,
        trnsItems: trnsStore.items,
        walletsItems: walletsStore.items,
      })

      return {
        date,
        ...total,
        expense: total.expense,
        income: total.income,
        sum: total.sum,
        summary: total.sum,
        trnsIds,
      }
    }).reverse(),
  )

  const statPrepareDataAverageAll = computed(() => {
    const totalPeriods = statPrepareData.value.reduce(
      (acc, cur) => {
        acc.income += cur.income
        acc.expense += cur.expense
        acc.sum += cur.sum
        return acc
      },
      {
        expense: 0,
        income: 0,
        sum: 0,
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
        type === 'income' ? 'income' : 'expense'
      ] > 0)
      || (appNavStore.activeTabStat === 'income' && type === 'income')
      || (appNavStore.activeTabStat === 'expense' && type === 'expense')

    const p2 = filter.periodNameWithAll.value === 'all'
    return p1 || p2
  }

  const statPrepareDataAverage = computed(() => {
    const d = statPrepareData.value.slice(1).reduce(
      (acc, cur) => {
        acc.income += cur.income
        acc.expense += cur.expense
        acc.sum += cur.sum
        return acc
      },
      {
        expense: 0,
        income: 0,
        sum: 0,
      },
    )

    return {
      expense: d.expense / periodsToShow.value,
      income: d.income / periodsToShow.value,
      sum: d.sum / periodsToShow.value,
    }
  })

  function getAllPeriodsTotal(data: typeof statPrepareData.value) {
    return data.reduce(
      (acc, cur) => {
        acc.income += cur.income
        acc.expense += cur.expense
        acc.summary += cur.sum
        return acc
      },
      {
        expense: 0,
        income: 0,
        summary: 0,
      },
    )
  }

  const statPrepareAllData = computed(() => getAllPeriodsTotal(statPrepareData.value))

  const chartCategories = computed(() =>
    statPrepareData.value.map(i => i.date),
  )

  const mTypes = {
    expense: 'expense',
    income: 'income',
    sum: 'sum',
  } as const

  interface TotalCategories {
    expense: TotalCategory[]
    income: TotalCategory[]
  }

  function getTotalCategories(
    categoriesWithTrns: ReturnType<typeof getCategoriesWithTrnsIds>,
  ) {
    const categories = Object.keys(categoriesWithTrns).reduce(
      (acc, categoryId) => {
        const totalInCategory = getTotal({
          baseCurrencyCode: currenciesStore.base,
          rates: currenciesStore.rates,
          trnsIds: categoriesWithTrns[categoryId],
          trnsItems: trnsStore.items,
          walletsIds: filter.walletsIds.value,
          walletsItems: walletsStore.items,
        })
        if (totalInCategory.income > 0) {
          acc.income.push({
            id: categoryId,
            trnsIds: categoriesWithTrns[categoryId].filter(
              trnId => trnsStore.items[trnId].type === 1,
            ),
            value: totalInCategory.income,
          })
        }

        if (totalInCategory.expense > 0) {
          acc.expense.push({
            id: categoryId,
            trnsIds: categoriesWithTrns[categoryId].filter(
              trnId => trnsStore.items[trnId].type === 0,
            ),
            value: totalInCategory.expense,
          })
        }

        return acc
      },
      {
        expense: [],
        income: [],
      } as TotalCategories,
    )

    return Object.keys(categories).reduce(
      (prev, type) => {
        prev[type] = categories[type].sort((a, b) => b?.value - a?.value)
        return prev
      },
      {
        expense: [],
        income: [],
      } as TotalCategories,
    )
  }

  function getCategoriesWithTrnsIds(trnsIds: TrnId[]) {
    return trnsIds.reduce(
      (prev, trnId) => {
        const categoryId = trnsStore.items[trnId]?.categoryId
        prev[categoryId] ??= []
        prev[categoryId].push(trnId)
        return prev
      },
      {} as Record<CategoryId, TrnId[]>,
    )
  }

  function getRootCategoriesWithTrnsIds(trnsIds: TrnId[]) {
    return trnsIds.reduce(
      (prev, trnId) => {
        const trnBaseCategory = categoriesStore.items[trnsStore.items[trnId]?.categoryId]

        const categoryId
          = trnBaseCategory.parentId === 0
            ? trnsStore.items[trnId]?.categoryId
            : trnBaseCategory.parentId

        prev[categoryId] ??= []
        prev[categoryId].push(trnId)
        return prev
      },
      {} as Record<CategoryId, TrnId[]>,
    )
  }

  function getHeyTotalCategories(trnsIds: TrnId[]) {
    return getTotalCategories(getCategoriesWithTrnsIds(trnsIds))
  }

  const totalCategories = computed(() => getHeyTotalCategories(trnsIds.value))

  interface TotalCategory {
    id: CategoryId
    trnsIds: TrnId[]
    value: number
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
      amount: [...statPrepareData.value].reverse()[selectedPeriodCount.value]?.[mTypes[slug]],
      averageAmount: statPrepareDataAverage.value[mTypes[slug]],
      colorizeType: getColorizeType(slug),
      isShownAverage: statPrepareDataAverage.value.sum !== 0,
      moneyTypeNumber: getMoneyTypeNumber(slug),
      moneyTypeSlugSum: slug,
    }
  }

  const averageSlugs = ['sum', 'expense', 'income'] as const

  const averages = computed(() => {
    return averageSlugs.reduce(
      (acc, slug) => {
        acc[slug] = getAverageItem(slug)
        return acc
      },
      {} as Record<MoneyTypeSlugSum, ReturnType<typeof getAverageItem>>,
    )
  })

  const isToday = computed(() =>
    dayjs().isSame(filter.date.value, filter.periodNameWithoutAll.value),
  )
  const isLastPeriod = computed(() =>
    dayjs(filter.date.value).isSame(avaDate.value, filter.periodNameWithoutAll.value),
  )

  const filters = {
    avaDate,
    filterPeriodMaxDateCount,
    isLastPeriod,
    isToday,
    trnsIds,
  } as const

  return {
    avaDate,
    averages,
    chartCategories,
    chartConfigShowedPeriodsCount,
    filterPeriodMaxDateCount,
    filters,
    getCategoriesWithTrnsIds,
    getColorizeType,
    getHeyTotalCategories,
    getMoneyTypeNumber,
    getRootCategoriesWithTrnsIds,
    getStatDataPrepared,
    getTotal,
    getTotalCategories,
    getTrnsIdsWithFilterNoDates,
    isLastPeriod,
    isShowGroupByType,
    isToday,
    periodsToShow,
    selectedPeriodCount,
    statPrepareAllData,
    statPrepareData,
    statPrepareDataAverage,
    statPrepareDataAverageAll,
    totalCategories,
    trnsIds,
  }
}

export type StatProvider = ReturnType<typeof useStat>
