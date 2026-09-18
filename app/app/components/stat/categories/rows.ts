import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { StatCategoryRow } from '~/components/stat/categories/ListView.vue'
import type { CategoryWithData } from '~/components/stat/types'

type GetWithParent = (id: CategoryId) => { category: CategoryItem, parentCategory: CategoryItem | undefined } | null

/** Resolves category records for the pure list views; items whose category is gone are dropped. */
export function buildStatCategoryRows(items: CategoryWithData[], getWithParent: GetWithParent): StatCategoryRow[] {
  return items.flatMap((item) => {
    const found = getWithParent(item.id)
    if (!found)
      return []
    const children = item.categories?.length ? buildStatCategoryRows(item.categories, getWithParent) : undefined
    return [{ ...found, children, item }]
  })
}
