import type { CategoryId } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'

export function filterFocusedCategories(
  categories: CategoryWithData[],
  childrenIds: CategoryId[],
): CategoryWithData[] {
  const childrenSet = new Set(childrenIds)
  return categories.filter(category => childrenSet.has(category.id))
}
