import type { Categories, CategoryId } from '~/components/categories/types'
import type { ChartType } from '~/components/stat/chart/types'
import type { ChartSeries, IntervalData, SeriesSlug } from '~/components/stat/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { getParentCategoryIdOrUndefined } from '~/components/categories/utils'

type BuildParams = {
  categoriesItems: Categories
  chartType: ChartType | undefined
  computeTotalForTrnsIds: (ids: TrnId[]) => { expense: number, income: number, sum: number }
  filterCategoriesIds?: CategoryId[]
  intervals: IntervalData[]
  isGrouped: boolean
  trnsItems: Record<TrnId, Pick<TrnItem, 'categoryId'>>
  type: SeriesSlug
}

function resolveCategoryId(
  trnCategoryId: CategoryId | undefined,
  categoriesItems: Categories,
  isGrouped: boolean,
): CategoryId | undefined {
  if (!trnCategoryId)
    return undefined
  if (!isGrouped)
    return trnCategoryId
  return getParentCategoryIdOrUndefined(categoriesItems, trnCategoryId) ?? trnCategoryId
}

export function buildCategoriesSeries({
  categoriesItems,
  chartType,
  computeTotalForTrnsIds,
  filterCategoriesIds,
  intervals,
  isGrouped,
  trnsItems,
  type,
}: BuildParams): ChartSeries[] {
  const filterSet = filterCategoriesIds?.length ? new Set(filterCategoriesIds) : undefined

  // For each interval, build a map of displayCategoryId -> trnIds[]
  const perIntervalByCategory: Record<CategoryId, TrnId[]>[] = intervals.map((interval) => {
    const bucket: Record<CategoryId, TrnId[]> = {}
    for (const trnId of interval.trnsIds) {
      const rawCategoryId = trnsItems[trnId]?.categoryId
      if (!rawCategoryId || rawCategoryId === 'transfer')
        continue
      if (filterSet && !filterSet.has(rawCategoryId))
        continue

      const displayId = resolveCategoryId(rawCategoryId, categoriesItems, isGrouped)
      if (!displayId)
        continue

      bucket[displayId] ??= []
      bucket[displayId].push(trnId)
    }
    return bucket
  })

  // Union of category ids across all intervals + their totals over the full range
  const categoryTotals: Record<CategoryId, number> = {}
  for (const bucket of perIntervalByCategory) {
    for (const [catId, trnIds] of Object.entries(bucket)) {
      const value = computeTotalForTrnsIds(trnIds)[type]
      categoryTotals[catId] = (categoryTotals[catId] ?? 0) + value
    }
  }

  // Sort categories by total descending
  const orderedCategoryIds = Object.keys(categoryTotals)
    .filter(id => categoryTotals[id]! > 0)
    .sort((a, b) => categoryTotals[b]! - categoryTotals[a]!)

  return orderedCategoryIds.map((catId): ChartSeries => {
    const category = categoriesItems[catId]
    const data = perIntervalByCategory.map(bucket =>
      bucket[catId] ? computeTotalForTrnsIds(bucket[catId])[type] : 0,
    )
    return {
      color: category?.color,
      data,
      name: category?.name ?? catId,
      type: chartType ?? 'bar',
    }
  })
}
