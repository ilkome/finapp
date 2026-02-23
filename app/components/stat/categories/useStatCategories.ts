import type { CategoryId } from '~/components/categories/types'
import type { CategoriesWithData, CategoryWithData } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { getParentCategoryIdOrUndefined } from '~/components/categories/utils'
import { sortCategoriesByAmount } from '~/components/stat/utils'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

export function useStatCategories() {
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const { getTotalOfTrnsIds } = useAmount()

  function collectCategoriesByTrns(trnsIds: TrnId[], preCategoriesIds?: CategoryId[]): CategoriesWithData {
    const transferIds = new Set(categoriesStore.transferCategoriesIds)
    const categoriesByTrns = trnsIds.reduce((acc, trnId) => {
      const categoryId = trnsStore.items?.[trnId]?.categoryId
      const category = categoryId && categoriesStore.items[categoryId]

      if (!categoryId || !category || transferIds.has(categoryId))
        return acc

      acc[categoryId] ??= {
        id: categoryId,
        name: category.name,
        trnsIds: [],
        value: 0,
      }
      acc[categoryId].trnsIds.push(trnId)
      return acc
    }, {} as CategoriesWithData)

    // Add preCategoriesIds to categoriesByTrns
    if (preCategoriesIds) {
      preCategoriesIds.forEach((catId) => {
        const category = categoriesStore.items[catId]
        if (!category)
          return

        categoriesByTrns[catId] = categoriesByTrns[catId] ?? {
          id: catId,
          name: category.name,
          trnsIds: [],
          value: 0,
        }
      })
    }

    return categoriesByTrns
  }

  function flattenCategories(categoriesByTrns: CategoriesWithData): CategoryWithData[] {
    return Object.values(categoriesByTrns)
      .map(cat => ({
        ...cat,
        value: getTotalOfTrnsIds(cat.trnsIds).sum,
      }))
      .sort(sortCategoriesByAmount)
  }

  function groupCategories(categoriesByTrns: CategoriesWithData): CategoryWithData[] {
    const groupedCategories = Object.values(categoriesByTrns).reduce((acc, cat) => {
      const parentId = getParentCategoryIdOrUndefined(categoriesStore.items, cat.id)
      const parentCategory = parentId && categoriesStore.items[parentId]
      const catTotal = getTotalOfTrnsIds(cat.trnsIds).sum

      if (!parentId || !parentCategory) {
        acc[cat.id] ??= {
          categories: [],
          id: cat.id,
          name: cat.name,
          trnsIds: cat.trnsIds,
          value: catTotal,
        }
        return acc
      }

      acc[parentId] ??= {
        categories: [],
        id: parentId,
        name: parentCategory.name,
        trnsIds: [],
        value: 0,
      }

      acc[parentId].categories ??= []
      acc[parentId].categories.push({
        ...cat,
        value: catTotal,
      })
      acc[parentId].trnsIds.push(...cat.trnsIds)
      acc[parentId].value += catTotal

      return acc
    }, {} as CategoriesWithData)

    // Sort child categories after grouping (not inside the loop)
    for (const group of Object.values(groupedCategories)) {
      if (group.categories?.length > 1)
        group.categories.sort(sortCategoriesByAmount)
    }

    return Object.values(groupedCategories).sort(sortCategoriesByAmount)
  }

  function getCategoriesWithData(trnsIds: TrnId[], isGrouped?: boolean, preCategoriesIds?: CategoryId[]): CategoryWithData[] {
    const categoriesByTrns = collectCategoriesByTrns(trnsIds, preCategoriesIds)

    return isGrouped
      ? groupCategories(categoriesByTrns)
      : flattenCategories(categoriesByTrns)
  }

  return {
    getCategoriesWithData,
  }
}
