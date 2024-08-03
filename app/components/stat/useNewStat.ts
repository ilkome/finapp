import dayjs from 'dayjs'
import { useCategoriesStore } from '~/components/categories/useCategories'
import type { TrnId } from '~/components/trns/types'
import type { CategoryId } from '~/components/categories/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import useAmount from '~/components/amount/useAmount'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { TotalReturns } from '~/components/amount/getTotal'
import type { PeriodNameWithAll } from '~/components/filter/useFilter'
import type { Range } from '~/components/date/types'
import { seriesOptions } from '~/components/stat/chart/config2'

function sortCategoriesByAmount(a: TotalCategory, b: TotalCategory) {
  if (!a || !b)
    return 0

  // Sort positive values from biggest to smallest
  if (a.value >= 0 && b.value >= 0) {
    return b.value - a.value
  }
  // Sort negative values from smallest to biggest
  else if (a.value < 0 && b.value < 0) {
    return a.value - b.value
  }
  // Keep positive values before negative values
  else if (a.value >= 0 && b.value < 0) {
    return -1
  }
  // Keep negative values after positive values
  else {
    return 1
  }
}

export type TotalCategories = {
  expense: TotalCategory[]
  income: TotalCategory[]
}

export type TotalCategory = {
  id: CategoryId
  trnsIds: TrnId[]
  value: number
}

export function useNewStat() {
  const trnsStore = useTrnsStore()
  const categoriesStore = useCategoriesStore()
  const { getTotalOfTrnsIds } = useAmount()

  function getCats(trnsIds: TrnId[], isGroupedByParent?: boolean, preCategoriesIds?: CategoryId[]) {
    const categoriesWithTrns = trnsIds?.reduce(
      (prev, trnId) => {
        let newCategoryId = trnsStore.items[trnId]?.categoryId

        if (categoriesStore.transferCategoriesIds.includes(newCategoryId))
          return prev

        if (isGroupedByParent) {
          const trnBaseCategory = categoriesStore.items[newCategoryId]

          newCategoryId
            = trnBaseCategory?.parentId === 0
              ? trnsStore.items[trnId]?.categoryId
              : trnBaseCategory?.parentId
        }

        prev[newCategoryId] ??= []
        prev[newCategoryId].push(trnId)
        return prev
      },
      {} as Record<CategoryId, TrnId[]>,
    )

    const categories = Object.keys(categoriesWithTrns)
      .reduce(
        (acc, categoryId) => {
          const totalInCategory = getTotalOfTrnsIds(categoriesWithTrns[categoryId]!)
          const trnsIdsInCategory = categoriesWithTrns[categoryId]!

          acc.push({
            id: categoryId,
            trnsIds: trnsIdsInCategory,
            value: totalInCategory.sum,
          })
          return acc
        },
        [] as TotalCategory[],
      )
      .sort((a, b) => sortCategoriesByAmount(a, b))

    if (preCategoriesIds && preCategoriesIds.length > 0) {
      preCategoriesIds.forEach((id) => {
        if (!categoriesWithTrns[id]) {
          categories.push({
            id,
            trnsIds: [],
            value: 0,
          })
        }
      })
    }
    return categories
  }

  function getCatsForChart(trnsIds: TrnId[], isGrouped?: boolean) {
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
        value: totalInCategory.sum,
      }

      return acc
    }, {} as Record<CategoryId, TotalCategory>)

    return Object.keys(categories).map(categoryId => categories[categoryId])
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
    total: TotalReturns[],
    type: MoneyTypeSlugSum,
    ranges: Range[],
  ) {
    // const types = type === 'sum' ? ['income', 'expense', 'sum'] : [type]
    const types = type === 'sum' ? ['expense', 'income'] : [type]

    return types.map((t, idx) => ({
      color: seriesOptions[t].color,
      cursor: 'default',
      data: total.map(i => t !== 'sum' ? Math.abs(i[t]) : i[t]),
      name: ranges[idx]?.start,
      type: seriesOptions[t].type,
    }))
  }

  function getUniqueIds(data) {
    const ids = new Set()

    for (const timestamp in data) {
      const records = data[timestamp]
      records.forEach(record => ids.add(record.id))
    }

    return Array.from(ids)
  }

  return {
    getCats,
    getCatsForChart,
    getPeriodsWithTrns,
    getSeries,
    getUniqueIds,
  }
}
