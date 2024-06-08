import { useCategoriesStore } from '../categories/useCategories'
import type { TrnId } from '~/components/trns/types'
import type { CategoryId } from '~/components/categories/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import useAmount from '~/components/amount/useAmount'

export interface TotalCategories {
  expense: TotalCategory[]
  income: TotalCategory[]
}

export interface TotalCategory {
  id: CategoryId
  trnsIds: TrnId[]
  value: number
}

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

  return {
    getCats,
  }
}
