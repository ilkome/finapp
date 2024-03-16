import dayjs from 'dayjs'
import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'
import { getOldestTrnDate } from '~/components/trns/helpers'
import { type TotalReturns, getTotal } from '~/components/amount/getTotal'
import {
  getTransactibleCategoriesIds,
  getTransferCategoriesIds,
} from '~/components/categories/getCategories'
import { getTrnsIds } from '~/components/trns/getTrns'
import { useChartStore } from '~/components/chart/useChartStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useFilter } from '~/components/filter/useFilter'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import { useCategoriesStore } from '~/components/categories/useCategories'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import type { MoneyTypeNumber, MoneyTypeSlug } from '~/components/stat/types'

const moneyTypes: {
  id: MoneyTypeSlug
  slug: MoneyTypeSlug
  type: MoneyTypeNumber
}[] = [
  {
    id: 'expense',
    slug: 'expense',
    type: 0,
  },
  {
    id: 'income',
    slug: 'income',
    type: 1,
  },
]
type CategoryTotal = Record<
  CategoryId,
  Record<'income', TotalReturns['incomeTransactions']> &
  Record<'expense', TotalReturns['expenseTransactions']>
>

export function useStat(viewBy = 'child') {
  const chartStore = useChartStore()
  const filterStore = useFilter()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  /**
   * Stat for current period
   */
  const statCurrentPeriod = computed(() => {
    const trnsItems = trnsStore.items
    const categoriesItems = categoriesStore.items
    const walletsItems = walletsStore.items
    const baseCurrencyCode = currenciesStore.base
    const rates = currenciesStore.rates
    const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)

    // TODO: move it to a separate function getFilterParams
    const categoriesIds
      = filterStore.catsIds.length > 0
        ? getTransactibleCategoriesIds(filterStore.catsIds, categoriesItems)
        : false
    const walletsIds
      = filterStore.walletsIds.length > 0 ? filterStore.walletsIds : false

    const trnsIds = getTrnsIds({
      categoriesIds,
      date: filterStore.date,
      periodName: filterStore.period,
      trnsItems,
      walletsIds,
    })

    function getRootCategoryIdFromTrnId(
      trnId: TrnId,
      excludeTransfer = false,
    ): CategoryId | false {
      const categories = categoriesStore.items
      const trnCategoryId = trnsItems[trnId].categoryId
      const trnCategoryParentId = categories[trnCategoryId]?.parentId
      const categoryId = trnCategoryParentId || trnCategoryId

      if (excludeTransfer && transferCategoriesIds.includes(categoryId))
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
      baseCurrencyCode,
      rates,
      transferCategoriesIds,
      trnsIds,
      trnsItems,
      walletsIds: filterStore.walletsIds,
      walletsItems,
    })

    // count total in categories
    const categoriesTotal: CategoryTotal = {}
    for (const categoryId in categoriesWithTrnsIds) {
      const trnsIdsInCategory = categoriesWithTrnsIds[categoryId]

      const totalInCategory = getTotal({
        baseCurrencyCode,
        rates,
        trnsIds: trnsIdsInCategory,
        trnsItems,
        walletsIds: filterStore.walletsIds,
        walletsItems,
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
      trnsIds: trnsIds.sort((a, b) => trnsItems[b].date - trnsItems[a].date),
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
    const trnsItems = trnsStore.items
    const walletsItems = walletsStore.items
    const categoriesItems = categoriesStore.items
    const baseCurrencyCode = currenciesStore.base
    const rates = currenciesStore.rates
    const trnsIds = trnsStore.selectedTrnsIds
    const periodName = filterStore.period
    const transferCategoriesIds = getTransferCategoriesIds(categoriesItems)
    const emptyData = { income: 0, expense: 0, sum: 0 }

    if (periodName === 'all')
      return emptyData

    const oldestTrn = trnsItems[trnsStore.firstCreatedTrnId]
    if (!oldestTrn)
      return emptyData

    const oldestTrnDate = getOldestTrnDate(trnsItems)
    let periodsToShow
      = dayjs().endOf(periodName).diff(oldestTrnDate, periodName) + 1

    periodsToShow
      = chartStore.periods[periodName].showedPeriods >= periodsToShow
        ? periodsToShow
        : chartStore.periods[periodName].showedPeriods

    let income = 0
    let expense = 0

    // Start from 1 to remove last period from average
    for (let period = 1; period < periodsToShow; period++) {
      const dateStartOfPeriod = dayjs()
        .subtract(period, periodName)
        .startOf(periodName)
      const dateEndOfPeriod = dayjs()
        .subtract(period, periodName)
        .endOf(periodName)

      // TODO: fix trnsIds
      const trnsIdsInPeriod = (trnsIds || []).filter(
        (trnId: TrnId) =>
          trnsItems[trnId].date >= dateStartOfPeriod
          && trnsItems[trnId].date <= dateEndOfPeriod
          && !transferCategoriesIds.includes(trnsItems[trnId].categoryId),
      )

      const total = getTotal({
        baseCurrencyCode,
        rates,
        transferCategoriesIds,
        trnsIds: trnsIdsInPeriod,
        trnsItems,
        walletsItems,
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
    moneyTypes,
  }
}
