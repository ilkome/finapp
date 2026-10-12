import type { Categories, CategoryId } from '~/components/categories/types'
import type { CategoriesWithData, CategoryWithData } from '~/components/stat/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { isSystemCategoryId } from '~/components/categories/utils'

export function sortCategoriesByAmount(a: Pick<CategoryWithData, 'value'>, b: Pick<CategoryWithData, 'value'>): number {
  if (a.value === 0 && b.value === 0)
    return 0
  if (a.value === 0)
    return 1
  if (b.value === 0)
    return -1

  const bothPositive = a.value > 0 && b.value > 0
  const bothNegative = a.value < 0 && b.value < 0

  if (bothPositive)
    return b.value - a.value
  if (bothNegative)
    return a.value - b.value
  return a.value > 0 ? -1 : 1
}

export function collectCategoriesByTrns(params: {
  categoriesItems: Categories
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  preCategoriesIds?: CategoryId[]
  trnsIds: TrnId[]
  trnsItems: Record<TrnId, Pick<TrnItem, 'categoryId'>>
}): CategoriesWithData {
  const { categoriesItems, excludedCategoriesIds, preCategoriesIds, trnsIds, trnsItems } = params

  const result: CategoriesWithData = {}

  for (const trnId of trnsIds) {
    const categoryId = trnsItems[trnId]?.categoryId
    const category = categoryId && categoriesItems[categoryId]

    if (!categoryId || !category || isSystemCategoryId(categoryId))
      continue
    if (excludedCategoriesIds?.has(categoryId))
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
      if (!category || excludedCategoriesIds?.has(catId))
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
