import type { CategoryId } from '~/components/categories/types'
import type { TrnId } from '~/components/trns/types'
import { type TotalReturns, getTotal } from '~/components/amount/getTotal'
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
  const filterStore = useFilter()
  const currenciesStore = useCurrenciesStore()
  const walletsStore = useWalletsStore()
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()

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
      expense: {
        biggest: expenseBiggest,
        total: total.expenseTransactions,
      },
      income: {
        biggest: incomeBiggest,
        total: total.incomeTransactions,
      },
    }
  })

  return {
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
