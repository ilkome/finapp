import type { Categories, CategoryId, CategoryItem } from '~/components/categories/types'

export function getTransactibleCategoriesIds(items: Categories, ids?: CategoryId[]) {
  const seen = new Set<CategoryId>()
  const result: CategoryId[] = []

  for (const id of ids ?? Object.keys(items ?? [])) {
    const category = items?.[id]
    if (category?.parentId === 0 && category?.childIds?.length) {
      for (const childId of category.childIds) {
        if (!seen.has(childId)) {
          seen.add(childId)
          result.push(childId)
        }
      }
    }
    else if (!seen.has(id)) {
      seen.add(id)
      result.push(id)
    }
  }

  return result
}

export function getParentCategoryIdOrReturnSame(items: Categories, categoryId: CategoryId): CategoryId {
  const category = items[categoryId]
  if (!category || category.parentId === 0)
    return categoryId
  return category.parentId ?? categoryId
}

export function getParentCategoryIdOrUndefined(items: Categories, categoryId: CategoryId): CategoryId | undefined {
  const category = items[categoryId]
  return category?.parentId === 0 ? undefined : category?.parentId
}

export function compareCategoriesByParentAndName(a: CategoryItem, b: CategoryItem, items: Categories): number {
  const parentNameA = items[a.parentId]?.name || ''
  const parentNameB = items[b.parentId]?.name || ''
  return parentNameA.localeCompare(parentNameB) || a.name.localeCompare(b.name)
}
