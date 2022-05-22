import type { CategoryID, CategoryItem } from '~/components/categories/types'

// TODO: need a proper name, maybe getTransactibleCategoriesIds
export function getCategoriesIds(
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
