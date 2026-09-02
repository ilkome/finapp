import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

export function filterFocusedCategories(
  categories: CategoryWithData[],
  childrenIds: CategoryId[],
): CategoryWithData[] {
  const childrenSet = new Set(childrenIds)
  return categories.filter(category => childrenSet.has(category.id))
}

export function countActiveFocusedChildren(options: {
  childrenIds: CategoryId[]
  trnsIds: TrnId[]
  trnsItems: Record<TrnId, Pick<TrnItem, 'categoryId'> | undefined>
}): number {
  const childrenSet = new Set(options.childrenIds)
  const activeIds = new Set<CategoryId>()

  for (const trnId of options.trnsIds) {
    const categoryId = options.trnsItems[trnId]?.categoryId
    if (categoryId && childrenSet.has(categoryId))
      activeIds.add(categoryId)
  }

  return activeIds.size
}

export function projectCategorySelection(options: {
  activeCategories: CategoryWithData[]
  getChildrenIds: (categoryId: CategoryId) => CategoryId[]
  getParentId: (categoryId: CategoryId) => CategoryId | undefined
  selectedIds: CategoryId[]
  visibleCategories: CategoryWithData[]
}): Map<CategoryId, CategoryId> {
  const activeIds = new Set(
    options.activeCategories
      .filter(category => category.trnsIds.length > 0)
      .map(category => category.id),
  )
  const visibleIds = new Set(options.visibleCategories.map(category => category.id))
  const selectedIdByVisibleId = new Map<CategoryId, CategoryId>()

  for (const selectedId of options.selectedIds) {
    if (visibleIds.has(selectedId)) {
      selectedIdByVisibleId.set(selectedId, selectedId)
      continue
    }

    const activeChildrenIds = options.getChildrenIds(selectedId).filter(id => activeIds.has(id))
    if (activeChildrenIds.length === 1 && visibleIds.has(activeChildrenIds[0]!)) {
      selectedIdByVisibleId.set(activeChildrenIds[0]!, selectedId)
      continue
    }

    const parentId = options.getParentId(selectedId)
    if (parentId && visibleIds.has(parentId))
      selectedIdByVisibleId.set(parentId, selectedId)
  }

  return selectedIdByVisibleId
}
