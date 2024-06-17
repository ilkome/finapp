import dayjs from 'dayjs'
import { useCategoriesStore } from '../categories/useCategories'
import type { TrnId } from '~/components/trns/types'
import type { CategoryId } from '~/components/categories/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import useAmount from '~/components/amount/useAmount'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { PeriodNameWithAll } from '~/components/filter/useFilter'

export interface TotalCategories {
  expense: TotalCategory[]
  income: TotalCategory[]
}

export interface TotalCategory {
  id: CategoryId
  trnsIds: TrnId[]
  value: number
}

const chartSeriesOptions = {
  expense: {
    color: 'var(--c-expense-1)',
    localeKey: 'money.expense',
    type: 'bar',
  },
  income: {
    color: 'var(--c-income-1)',
    localeKey: 'money.expense',
    type: 'bar',
  },
  sum: {
    color: 'grey',
    localeKey: 'money.sum',
    type: 'line',
  },
} as const

export function useNewStat() {
  const trnsStore = useTrnsStore()
  const categoriesStore = useCategoriesStore()
  const { getTotalOfTrnsIds } = useAmount()

  function getCats(trnsIds: TrnId[], isGrouped?: boolean) {
    const categoriesWithTrns = trnsIds?.reduce(
      (prev, trnId) => {
        let newCategoryId = trnsStore.items[trnId]?.categoryId

        if (categoriesStore.transferCategoriesIds.includes(newCategoryId))
          return prev

        if (isGrouped) {
          const trnBaseCategory = categoriesStore.items[newCategoryId]

          newCategoryId
            = trnBaseCategory.parentId === 0
              ? trnsStore.items[trnId]?.categoryId
              : trnBaseCategory.parentId
        }

        prev[newCategoryId] ??= []
        prev[newCategoryId].push(trnId)
        return prev
      },
      {} as Record<CategoryId, TrnId[]>,
    )

    const categories = Object.keys(categoriesWithTrns).reduce((acc, categoryId) => {
      const totalInCategory = getTotalOfTrnsIds(categoriesWithTrns[categoryId])

      acc[categoryId] = {
        id: categoryId,
        trnsIds: categoriesWithTrns[categoryId],
        value: totalInCategory.sum,
      }

      return acc
    }, {} as Record<CategoryId, TotalCategory>)

    return Object.keys(categories)
      .sort((a, b) => {
        // Sort positive values from biggest to smallest
        if (categories[a].value >= 0 && categories[b].value >= 0) {
          return categories[b].value - categories[a].value
        }
        // Sort negative values from smallest to biggest
        else if (categories[a].value < 0 && categories[b].value < 0) {
          return categories[a].value - categories[b].value
        }
        // Keep positive values before negative values
        else if (categories[a].value >= 0 && categories[b].value < 0) {
          return -1
        }
        // Keep negative values after positive values
        else {
          return 1
        }
      })
      .reduce(
        (prev, categoryId) => {
          prev.push(categories[categoryId])
          return prev
        },
        [] as TotalCategory[],
      )
  }

  function getPeriodsWithTrns(trnsIds: TrnId[], period: PeriodNameWithAll, groups: Record<string, TrnId[]>) {
    const periodNoAll = period === 'all' ? 'year' : period
    const groupsWithTrns = structuredClone(groups)

    trnsIds.forEach((trnId) => {
      const date = dayjs(trnsStore.items[trnId]?.date)
        .startOf(periodNoAll)
        .valueOf()
      groupsWithTrns[date]?.push(trnId)
    })

    return groupsWithTrns
  }

  function getSeries(
    total: Record<string, TotalReturns>,
    type: MoneyTypeSlugSum,
  ) {
    // const types = type === 'sum' ? ['income', 'expense', 'sum'] : [type]
    const types = type === 'sum' ? ['income', 'expense'] : [type]

    return types.map(t => ({
      color: chartSeriesOptions[t].color,
      data: Object.values(total).map(i => t !== 'sum' ? Math.abs(i[t]) : i[t]),
      name: chartSeriesOptions[t].name,
      type: chartSeriesOptions[t].type,
    }))
  }

  return {
    getCats,
    getPeriodsWithTrns,
    getSeries,
  }
}
