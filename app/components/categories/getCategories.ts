import type { CategoryId, CategoryItem } from '~/components/categories/types'

export function getTransferCategoriesIds(items: Record<CategoryId, CategoryItem>): CategoryId[] {
  const names = ['перевод', 'transfer']

  const categoriesIdsByName = Object.keys(items)
    .filter(id => names.includes(items[id].name.toLowerCase()))

  return [...categoriesIdsByName, 'transfer']
}

export function getParentCategory(
  items: Record<CategoryId, CategoryItem>,
  parentId: CategoryId | 0,
): CategoryItem | false {
  if (parentId === 0)
    return false

  return items[parentId]
}

export function getParentCategoryId(
  items: Record<CategoryId, CategoryItem>,
  categoryId: CategoryId,
): CategoryId {
  if (items[categoryId].parentId === 0)
    return categoryId

  return items[categoryId].parentId
}
