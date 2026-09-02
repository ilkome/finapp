import type { Categories, CategoryId } from '~/components/categories/types'
import type { CategoryGrouping } from '~/components/stat/config/schema'
import type { CategoryWithData } from '~/components/stat/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { getParentCategoryIdOrUndefined } from '~/components/categories/utils'
import { collectCategoriesByTrns, flattenCategoriesWithValues, sortCategoriesByAmount } from '~/components/stat/categories/collectAndGroup'
import { deferStatDevMetricsUpdate, getStatMetricNow, statDevMetrics } from '~/components/stat/statDevMetrics'

export type CategoryViews = {
  grouped: CategoryWithData[]
  ungrouped: CategoryWithData[]
}

export function collectRoundCategoryIds(params: {
  favoriteCategoryIds: CategoryId[]
  filteredCategoryIds: CategoryId[]
  isShowFavorites: boolean
  isShowRecent: boolean
  preCategoryIds?: CategoryId[]
  recentCategoryIds: CategoryId[]
}): CategoryId[] {
  const ids: CategoryId[] = []
  const seen = new Set<CategoryId>()
  const add = (id: CategoryId) => {
    if (!seen.has(id)) {
      seen.add(id)
      ids.push(id)
    }
  }

  for (const id of params.preCategoryIds ?? [])
    add(id)
  if (params.isShowFavorites) {
    for (const id of params.favoriteCategoryIds)
      add(id)
  }
  if (params.isShowRecent) {
    for (const id of params.recentCategoryIds)
      add(id)
  }
  for (const id of params.filteredCategoryIds)
    add(id)

  return ids
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
        trend: leaf.trend?.map(() => 0),
        trnsIds: [],
        value: 0,
      }
      groups.set(groupId, group)
    }
    group.trnsIds.push(...leaf.trnsIds)
    group.value += leaf.value
    if (group.trend && leaf.trend) {
      for (const [index, value] of leaf.trend.entries())
        group.trend[index] = (group.trend[index] ?? 0) + value
    }
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
  intervals?: ReadonlyArray<{ trnsIds: TrnId[] }>
  trnsIds: TrnId[]
  trnsItems: Record<TrnId, Pick<TrnItem, 'categoryId'>>
}): CategoryViews {
  const startedAt = import.meta.dev ? getStatMetricNow() : 0
  const collected = collectCategoriesByTrns(params)
  const ungrouped = flattenCategoriesWithValues(collected, params.computeValue)
  if (params.intervals?.length) {
    const intervalByTrnId = new Map<TrnId, number>()
    for (const [intervalIndex, interval] of params.intervals.entries()) {
      for (const trnId of interval.trnsIds)
        intervalByTrnId.set(trnId, intervalIndex)
    }

    for (const category of ungrouped) {
      const idsByInterval = params.intervals.map(() => [] as TrnId[])
      for (const trnId of category.trnsIds) {
        const intervalIndex = intervalByTrnId.get(trnId)
        if (intervalIndex !== undefined)
          idsByInterval[intervalIndex]!.push(trnId)
      }
      category.trend = idsByInterval.map(ids => ids.length ? Math.abs(params.computeValue(ids)) : 0)
    }
  }
  const result = { grouped: groupLeafValues(ungrouped, params.categoriesItems), ungrouped }
  if (import.meta.dev) {
    const duration = getStatMetricNow() - startedAt
    deferStatDevMetricsUpdate(() => {
      statDevMetrics.categoryAggregationCount.value++
      statDevMetrics.categoryAggregationDuration.value = duration
      statDevMetrics.categoryVisitedIds.value = params.trnsIds.length
    })
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
  const trendLength = views.ungrouped.find(category => category.trend)?.trend?.length
  for (const id of categoryIds) {
    const category = categoriesItems[id]
    if (!category || existing.has(id) || excludedCategoriesIds?.has(id))
      continue
    existing.add(id)
    ungrouped.push({
      id,
      name: category.name,
      trend: trendLength ? Array.from<number>({ length: trendLength }).fill(0) : undefined,
      trnsIds: [],
      value: 0,
    })
  }
  ungrouped.sort(sortCategoriesByAmount)
  return { grouped: groupLeafValues(ungrouped, categoriesItems), ungrouped }
}

export function resolveCategoryGrouping(
  views: CategoryViews,
  grouping: CategoryGrouping,
  activeLeaves: CategoryWithData[] = views.ungrouped,
): CategoryWithData[] {
  if (grouping === 'parent')
    return views.grouped
  if (grouping === 'child')
    return views.ungrouped

  const activeIds = new Set(activeLeaves.filter(category => category.trnsIds.length > 0).map(category => category.id))
  return views.grouped.flatMap((group) => {
    if (!group.categories?.length)
      return [group]
    const activeChildrenCount = group.categories.filter(category => activeIds.has(category.id)).length
    return activeChildrenCount > 1 ? [group] : group.categories
  }).sort(sortCategoriesByAmount)
}
