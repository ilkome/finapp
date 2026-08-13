import type { Categories, CategoryId } from '~/components/categories/types'
import type { CategoryWithData } from '~/components/stat/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { getParentCategoryIdOrUndefined } from '~/components/categories/utils'
import { collectCategoriesByTrns, flattenCategoriesWithValues, sortCategoriesByAmount } from '~/components/stat/categories/collectAndGroup'
import { getStatMetricNow, statDevMetrics } from '~/components/stat/statDevMetrics'

export type CategoryViews = {
  grouped: CategoryWithData[]
  ungrouped: CategoryWithData[]
}

function groupLeafValues(leaves: CategoryWithData[], categoriesItems: Categories): CategoryWithData[] {
  const groups = new Map<CategoryId, CategoryWithData>()
  for (const leaf of leaves) {
    const parentId = getParentCategoryIdOrUndefined(categoriesItems, leaf.id)
    const parent = parentId ? categoriesItems[parentId] : undefined
    const groupId = parentId && parent ? parentId : leaf.id
    let group = groups.get(groupId)
    if (!group) {
      group = {
        categories: [],
        id: groupId,
        name: parent?.name ?? leaf.name,
        trnsIds: [],
        value: 0,
      }
      groups.set(groupId, group)
    }
    group.trnsIds.push(...leaf.trnsIds)
    group.value += leaf.value
    if (parent)
      group.categories!.push(leaf)
  }
  for (const group of groups.values()) {
    if (group.categories!.length > 1)
      group.categories!.sort(sortCategoriesByAmount)
  }
  return [...groups.values()].sort(sortCategoriesByAmount)
}

export function buildCategoryViews(params: {
  categoriesItems: Categories
  computeValue: (trnsIds: TrnId[]) => number
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  trnsIds: TrnId[]
  trnsItems: Record<TrnId, Pick<TrnItem, 'categoryId'>>
}): CategoryViews {
  const startedAt = import.meta.dev ? getStatMetricNow() : 0
  const collected = collectCategoriesByTrns(params)
  const ungrouped = flattenCategoriesWithValues(collected, params.computeValue)
  const result = { grouped: groupLeafValues(ungrouped, params.categoriesItems), ungrouped }
  if (import.meta.dev) {
    statDevMetrics.categoryAggregationCount.value++
    statDevMetrics.categoryAggregationDuration.value = getStatMetricNow() - startedAt
    statDevMetrics.categoryVisitedIds.value = params.trnsIds.length
  }
  return result
}

export function addEmptyCategoryViews(
  views: CategoryViews,
  categoriesItems: Categories,
  categoryIds: CategoryId[],
  excludedCategoriesIds?: ReadonlySet<CategoryId>,
): CategoryViews {
  const existing = new Set(views.ungrouped.map(category => category.id))
  const ungrouped = [...views.ungrouped]
  for (const id of categoryIds) {
    const category = categoriesItems[id]
    if (!category || existing.has(id) || excludedCategoriesIds?.has(id))
      continue
    existing.add(id)
    ungrouped.push({ id, name: category.name, trnsIds: [], value: 0 })
  }
  ungrouped.sort(sortCategoriesByAmount)
  return { grouped: groupLeafValues(ungrouped, categoriesItems), ungrouped }
}
