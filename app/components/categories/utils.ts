import type { Categories, CategoryId } from '~/components/categories/types'

export function getTransactibleCategoriesIds(items: Categories, ids?: CategoryId[]) {
  if (ids) {
    return ids.filter((id) => {
      const category = items?.[id]
      const hasNoChildren = !category?.childIds?.length

      return (category?.parentId === 0 && hasNoChildren) || category?.parentId !== 0
    })
  }

  return Object.entries(items ?? {}).reduce((acc, [id, category]) => {
    if (category.parentId === 0 && category.childIds?.length) {
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
