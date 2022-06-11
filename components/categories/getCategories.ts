import type { CategoryID, CategoryItem } from '~/components/categories/types'

export function getTransactibleCategoriesIds(
  catsIds: CategoryID[],
  categoriesItems: Record<CategoryID, CategoryItem>,
): CategoryID[] {
  return catsIds.map(id => categoriesItems[id]?.childIds ?? id).flat()
}

export function getTransferCategoriesIds(items: Record<CategoryID, CategoryItem>): CategoryID[] {
  const names = ['перевод', 'transfer']

  const categoriesIdsByName = Object.keys(items)
    .filter(id => names.includes(items[id].name.toLowerCase()))

  return [...categoriesIdsByName, 'transfer']
}

export function getParentCategory(
  items: Record<CategoryID, CategoryItem>,
  parentId: CategoryID | 0,
): CategoryItem | false {
  if (parentId === 0)
    return false

  return items[parentId]
}
