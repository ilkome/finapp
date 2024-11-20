import type { Categories, CategoryId, CategoryItem } from '~/components/categories/types'

export function getTransactibleCategoriesIds(items: Categories, ids?: CategoryId[]) {
  return (ids ?? Object.keys(items ?? [])).reduce((acc, id) => {
    const category = items?.[id]
    if (category?.parentId === 0 && category?.childIds?.length) {
      acc.push(...category.childIds.filter(childId => !acc.includes(childId)))
    }
    else if (!acc.includes(id)) {
      acc.push(id)
    }
    return acc
  }, [] as CategoryId[])
}

export function getTransferCategoriesIds(items: Categories): CategoryId[] {
  const names = ['перевод', 'transfer']
  return [
    ...Object.keys(items ?? {})
      .filter(id => names.includes(`${items[id]?.name}`.toLowerCase())),
  ]
}

export function compareCategoriesByParentAndName(a: CategoryItem, b: CategoryItem, items: Categories): number {
  const parentNameA = items[a.parentId]?.name || ''
  const parentNameB = items[b.parentId]?.name || ''
  return parentNameA.localeCompare(parentNameB) || a.name.localeCompare(b.name)
}
