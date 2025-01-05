import type { Categories, CategoryId, CategoryItem } from '~/components/categories/types'

export function getParentCategory(items: Categories, parentId: CategoryId | 0): CategoryItem | false {
  if (parentId === 0)
    return false

  return items[parentId] ?? false
}

export function getParentCategoryId(items: Categories, categoryId: CategoryId): CategoryId {
  const category = items[categoryId]
  if (!category || category.parentId === 0)
    return categoryId
  return category.parentId ?? categoryId
}
