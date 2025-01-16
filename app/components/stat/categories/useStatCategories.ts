import type { CategoryId } from '~/components/categories/types'
import type { CategoriesWithData, CategoryWithData } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { useAmount } from '~/components/amount/useAmount'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { sortCategoriesByAmount } from '~/components/stat/utils'
import { useTrnsStore } from '~/components/trns/useTrnsStore'

export function useStatCategories() {
  const categoriesStore = useCategoriesStore()
  const trnsStore = useTrnsStore()
  const { getTotalOfTrnsIds } = useAmount()

  function getParentCategoryId(categoryId: CategoryId): CategoryId | undefined {
    const category = categoriesStore.items[categoryId]
    return category?.parentId === 0 ? undefined : category?.parentId
  }

  function collectCategoriesByTrns(trnsIds: TrnId[], preCategoriesIds?: CategoryId[]): CategoriesWithData {
    const categoriesByTrns = trnsIds.reduce((acc, trnId) => {
      const categoryId = trnsStore.items?.[trnId]?.categoryId
      const category = categoryId && categoriesStore.items[categoryId]

      if (!categoryId || !category || categoriesStore.transferCategoriesIds.includes(categoryId))
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
      const parentId = getParentCategoryId(cat.id)
      const parentCategory = parentId && categoriesStore.items[parentId]

      if (!parentId || !parentCategory) {
        acc[cat.id] ??= {
          categories: [],
          id: cat.id,
          name: cat.name,
          trnsIds: cat.trnsIds,
          value: getTotalOfTrnsIds(cat.trnsIds).sum,
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
        value: getTotalOfTrnsIds(cat.trnsIds).sum,
      })
      acc[parentId].trnsIds.push(...cat.trnsIds)
      acc[parentId].value += getTotalOfTrnsIds(cat.trnsIds).sum
      acc[parentId].categories.sort(sortCategoriesByAmount)

      return acc
    }, {} as CategoriesWithData)

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
    getParentCategoryId,
  }
}
