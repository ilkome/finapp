import type { CategoryID, CategoryItem } from '~/components/categories/types'

// TODO: need a proper name
export function getCategoriesIds(catsIds: CategoryID[], categoriesItems) {
  const ids: CategoryID[] = []

  for (const catId of catsIds) {
    const category = categoriesItems[catId]
    category?.childIds
      ? ids.push(...category.childIds)
      : ids.push(catId)
  }

  return ids
}

export function getTransferCategoriesIds(items: Record<CategoryID, CategoryItem>): CategoryID[] {
  const names = ['перевод', 'transfer']

  const categoriesIdsByName = Object.keys(items)
    .filter(id => names.includes(items[id].name.toLowerCase()))

  return [...categoriesIdsByName, 'transfer']
}
