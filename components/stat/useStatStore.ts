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

export const useStat = defineStore('stat', () => {
  const chartStore = useChartStore()
  const filterStore = useFilter()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

  /**
   * Stat for current period
   */

  const categoriesWithTrnsIds = computed(() => trnsStore.filteredTrnsIds.reduce(
    (prev, trnId) => {
      const categoryId = trnsStore.items[trnId]?.categoryId
      prev[categoryId] ??= []
      prev[categoryId].push(trnId)
      return prev
    },
    {} as Record<CategoryId, TrnId[]>,
  ))

  const statCurrentPeriod = computed(() => {
    // count total in categories
    const categoriesTotal: CategoryTotal = {}
    for (const categoryId in categoriesWithTrnsIds.value) {
      const trnsIdsInCategory = categoriesWithTrnsIds.value[categoryId]

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

    for (const categoryId in categoriesWithTrnsIds.value) {
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

    const total = getTotal({
      baseCurrencyCode: currenciesStore.base,
      rates: currenciesStore.rates,
      transferCategoriesIds: categoriesStore.transferCategoriesIds,
      trnsIds: trnsStore.filteredTrnsIds,
      trnsItems: trnsStore.items,
      walletsIds: filterStore.walletsIds,
      walletsItems: walletsStore.items,
    })

    return {
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
      = dayjs()
        .endOf(filterStore.period)
        .diff(trnsStore.oldestTrnDate, filterStore.period) + 1

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
          && !categoriesStore.transferCategoriesIds.includes(
            trnsStore.items[trnId].categoryId,
          ),
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
    categoriesWithTrnsIds,
    statAverage,
    statCurrentPeriod,
  }
})

// function getRootCategoryIdFromTrnId(
//   trnId: TrnId,
// ): CategoryId | false {
//   const trnCategoryId = trnsStore.items[trnId].categoryId
//   const trnCategoryParentId = categoriesStore.items[trnCategoryId]?.parentId
//   const categoryId = trnCategoryParentId || trnCategoryId

//   if (categoriesStore.transferCategoriesIds.includes(categoryId))
//     return false

//   return categoryId
// }
