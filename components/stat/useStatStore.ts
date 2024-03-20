import dayjs from 'dayjs'
import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'
import { type TotalReturns, getTotal } from '~/components/amount/getTotal'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useChartStore } from '~/components/stat/chart/useChartStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { MoneyTypeSlug } from '~/components/stat/types'

type CategoryTotal = Record<
  CategoryId,
  Record<'income', TotalReturns['incomeTransactions']> &
  Record<'expense', TotalReturns['expenseTransactions']>
>

export const useStat = defineStore('stat', () => {
  const chartStore = useChartStore()
  const filterStore = useFilter()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  const viewBy: 'child' | 'parent' = 'child'

  /**
   * Stat for current period
   */
  const statCurrentPeriod = computed(() => {
    // TODO: move it to a separate function getFilterParams
    const categoriesIds
      = filterStore.catsIds.length > 0
        ? categoriesStore.getTransactibleIds(filterStore.catsIds)
        : false
    const walletsIds
      = filterStore.walletsIds.length > 0 ? filterStore.walletsIds : false

    const trnsIds = getTrnsIds({
      categoriesIds,
      date: filterStore.date,
      periodName: filterStore.period,
      trnsItems: trnsStore.items,
      walletsIds,
    })

    function getRootCategoryIdFromTrnId(
      trnId: TrnId,
      excludeTransfer = false,
    ): CategoryId | false {
      const categories = categoriesStore.items
      const trnCategoryId = trnsStore.items[trnId].categoryId
      const trnCategoryParentId = categories[trnCategoryId]?.parentId
      const categoryId = trnCategoryParentId || trnCategoryId

      if (excludeTransfer && categoriesStore.transferCategoriesIds.includes(categoryId))
        return false

      return categoryId
    }

    const categoriesWithTrnsIds: Record<CategoryId, TrnId[]> = {}
    for (const trnId of trnsIds) {
      const categoryId
        = viewBy === 'parent'
          ? getRootCategoryIdFromTrnId(trnId, true)
          : trnsStore.items[trnId]?.categoryId

      if (!categoryId)
        continue

      categoriesWithTrnsIds[categoryId] ??= []
      categoriesWithTrnsIds[categoryId].push(trnId)
    }

    const total = getTotal({
      baseCurrencyCode: currenciesStore.base,
      rates: currenciesStore.rates,
      transferCategoriesIds: categoriesStore.transferCategoriesIds,
      trnsIds,
      trnsItems: trnsStore.items,
      walletsIds: filterStore.walletsIds,
      walletsItems: walletsStore.items,
    })

    // count total in categories
    const categoriesTotal: CategoryTotal = {}
    for (const categoryId in categoriesWithTrnsIds) {
      const trnsIdsInCategory = categoriesWithTrnsIds[categoryId]

      const totalInCategory = getTotal({
        baseCurrencyCode: currenciesStore.base,
        rates: currenciesStore.rates,
        trnsIds: trnsIdsInCategory,
        trnsItems: trnsStore.items,
        walletsIds: filterStore.walletsIds,
        walletsItems: walletsStore.items,
      })

      // totalInCategory
      categoriesTotal[categoryId] = {
        income: totalInCategory.incomeTransactions,
        expense: totalInCategory.expenseTransactions,
      }
    }

    // separate categories by income and expense
    const statIncome: CategoryTotal = {}
    const statExpense: CategoryTotal = {}
    for (const categoryId in categoriesWithTrnsIds) {
      const total = categoriesTotal[categoryId]
      if (total.income > 0)
        statIncome[categoryId] = total
      if (total.expense > 0)
        statExpense[categoryId] = total
    }

    // sorted
    const incomeCategoriesIds = Object.keys(statIncome).sort(
      (a, b) => statIncome[b].income - statIncome[a].income,
    )
    const expenseCategoriesIds = Object.keys(statExpense).sort(
      (a, b) => statExpense[b].expense - statExpense[a].expense,
    )

    // get first item in sorted categories
    function getBiggestAmount(
      categoriesTotal: CategoryTotal,
      categoriesIds: CategoryId[],
      moneyTypeSlug: MoneyTypeSlug,
    ) {
      const biggestAmount = categoriesIds[0]
      return (
        (categoriesTotal[biggestAmount]
        && Math.abs(categoriesTotal[biggestAmount][moneyTypeSlug]))
        || 0
      )
    }

    // biggest
    const expenseBiggest = getBiggestAmount(
      categoriesTotal,
      expenseCategoriesIds,
      'expense',
    )
    const incomeBiggest = getBiggestAmount(
      categoriesTotal,
      incomeCategoriesIds,
      'income',
    )

    return {
      trnsIds: trnsIds.sort((a, b) => trnsStore.items[b].date - trnsStore.items[a].date),
      categories: categoriesTotal,
      total: total.sumTransactions,
      expense: {
        biggest: expenseBiggest,
        categoriesIds: expenseCategoriesIds,
        total: total.expenseTransactions,
      },
      income: {
        biggest: incomeBiggest,
        categoriesIds: incomeCategoriesIds,
        total: total.incomeTransactions,
      },
    }
  })

  const statAverage = computed(() => {
    const emptyData = { income: 0, expense: 0, sum: 0 }

    if (filterStore.period === 'all')
      return emptyData

    const oldestTrn = trnsStore.items[trnsStore.firstCreatedTrnId]
    if (!oldestTrn)
      return emptyData

    let periodsToShow
      = dayjs().endOf(filterStore.period).diff(trnsStore.oldestTrnDate, filterStore.period) + 1

    periodsToShow
      = chartStore.periods[filterStore.period].showedPeriods >= periodsToShow
        ? periodsToShow
        : chartStore.periods[filterStore.period].showedPeriods

    let income = 0
    let expense = 0

    // Start from 1 to remove last period from average
    for (let period = 1; period < periodsToShow; period++) {
      const dateStartOfPeriod = dayjs()
        .subtract(period, filterStore.period)
        .startOf(filterStore.period)
      const dateEndOfPeriod = dayjs()
        .subtract(period, filterStore.period)
        .endOf(filterStore.period)

      const trnsIdsInPeriod = trnsStore.allTrnsIdsWithFilter.filter(
        (trnId: TrnId) =>
          trnsStore.items[trnId].date >= dateStartOfPeriod
          && trnsStore.items[trnId].date <= dateEndOfPeriod
          && !categoriesStore.transferCategoriesIds.includes(trnsStore.items[trnId].categoryId),
      )

      const total = getTotal({
        baseCurrencyCode: currenciesStore.base,
        rates: currenciesStore.rates,
        transferCategoriesIds: categoriesStore.transferCategoriesIds,
        trnsIds: trnsIdsInPeriod,
        trnsItems: trnsStore.items,
        walletsItems: walletsStore.items,
      })

      income += total.incomeTransactions
      expense += total.expenseTransactions
    }

    // When just this period and last
    const delimiter = periodsToShow - 1
    if (delimiter <= 1)
      return emptyData

    return {
      income: Math.ceil(income / delimiter),
      expense: Math.ceil(expense / delimiter),
      sum: Math.ceil((income - expense) / delimiter),
    }
  })

  return {
    statAverage,
    statCurrentPeriod,
  }
})
