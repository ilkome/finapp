import type { CategoryId } from '~/components/categories/types'

export function getSelectedParentCategoryId(params: {
  getChildrenIds: (categoryId: CategoryId) => CategoryId[]
  rootIds: readonly CategoryId[]
  selectedIds: readonly CategoryId[]
}): CategoryId | undefined {
  const selected = new Set(params.selectedIds)
  if (selected.size === 0)
    return undefined

  for (const rootId of params.rootIds) {
    const children = params.getChildrenIds(rootId)
    if (selected.size === 1 && selected.has(rootId) && children.length > 0)
      return rootId
    if (children.length === selected.size && children.every(id => selected.has(id)))
      return rootId
  }

  return undefined
}
