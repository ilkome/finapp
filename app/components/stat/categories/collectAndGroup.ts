import type { Categories, CategoryId } from '~/components/categories/types'
import type { CategoriesWithData, CategoryWithData } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

import { getParentCategoryIdOrUndefined } from '~/components/categories/utils'

export function sortCategoriesByAmount(a: CategoryWithData, b: CategoryWithData) {
  if (!a || !b)
    return 0

  if (a.value === 0)
    return 1
  if (b.value === 0)
    return -1

  const isP = a.value > 0 && b.value > 0
  const isN = a.value < 0 && b.value < 0

  if (isP)
    return b.value - a.value
  if (isN)
    return a.value - b.value
  return a.value > 0 ? -1 : 1
}

export function collectCategoriesByTrns(params: {
  categoriesItems: Categories
  preCategoriesIds?: CategoryId[]
  trnsIds: TrnId[]
  trnsItems: Record<TrnId, { categoryId?: string }>
}): CategoriesWithData {
  const { categoriesItems, preCategoriesIds, trnsIds, trnsItems } = params

  const result: CategoriesWithData = {}

  for (const trnId of trnsIds) {
    const categoryId = trnsItems[trnId]?.categoryId
    const category = categoryId && categoriesItems[categoryId]

    if (!categoryId || !category || categoryId === 'transfer')
      continue

    result[categoryId] ??= {
      id: categoryId,
      name: category.name,
      trnsIds: [],
      value: 0,
    }
    result[categoryId].trnsIds.push(trnId)
  }

  if (preCategoriesIds) {
    for (const catId of preCategoriesIds) {
      const category = categoriesItems[catId]
      if (!category)
        continue

      result[catId] ??= {
        id: catId,
        name: category.name,
        trnsIds: [],
        value: 0,
      }
    }
  }

  return result
}

export function flattenCategoriesWithValues(
  categoriesByTrns: CategoriesWithData,
  computeValue: (trnsIds: TrnId[]) => number,
): CategoryWithData[] {
  return Object.values(categoriesByTrns)
    .map(cat => ({
      ...cat,
      value: computeValue(cat.trnsIds),
    }))
    .sort(sortCategoriesByAmount)
}

export function groupCategoriesWithValues(
  categoriesByTrns: CategoriesWithData,
  categoriesItems: Categories,
  computeValue: (trnsIds: TrnId[]) => number,
): CategoryWithData[] {
  const grouped: CategoriesWithData = {}

  for (const cat of Object.values(categoriesByTrns)) {
    const parentId = getParentCategoryIdOrUndefined(categoriesItems, cat.id)
    const parentCategory = parentId && categoriesItems[parentId]
    const catTotal = computeValue(cat.trnsIds)

    if (!parentId || !parentCategory) {
      grouped[cat.id] ??= {
        categories: [],
        id: cat.id,
        name: cat.name,
        trnsIds: cat.trnsIds,
        value: catTotal,
      }
      continue
    }

    grouped[parentId] ??= {
      categories: [],
      id: parentId,
      name: parentCategory.name,
      trnsIds: [],
      value: 0,
    }

    grouped[parentId].categories ??= []
    grouped[parentId].categories.push({
      ...cat,
      value: catTotal,
    })
    grouped[parentId].trnsIds.push(...cat.trnsIds)
    grouped[parentId].value += catTotal
  }

  for (const group of Object.values(grouped)) {
    if (group.categories && group.categories.length > 1)
      group.categories.sort(sortCategoriesByAmount)
  }

  return Object.values(grouped).sort(sortCategoriesByAmount)
}
