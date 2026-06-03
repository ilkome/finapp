import type { Categories, CategoryId } from '~/components/categories/types'
import type { ChartType } from '~/components/stat/chart/types'
import type { ChartSeries, IntervalData, SeriesSlug } from '~/components/stat/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { getParentCategoryIdOrUndefined } from '~/components/categories/utils'

/** Neutral grey used for the aggregated "Other" slice/series. */
const OTHER_SLICE_COLOR = 'var(--ui-text-dimmed)'
/** Synthetic id for the aggregated "Other" pie slice. Not a real category. */
export const OTHER_SLICE_ID = '__other__'
/** Default number of top categories shown before the rest roll up into "Other". */
const DEFAULT_PIE_TOP_N = 8

type AggregateParams = {
  categoriesItems: Categories
  computeTotalForTrnsIds: (ids: TrnId[]) => { expense: number, income: number, sum: number }
  filterCategoriesIds?: CategoryId[]
  intervals: IntervalData[]
  isGrouped: boolean
  trnsItems: Record<TrnId, Pick<TrnItem, 'categoryId'>>
  type: SeriesSlug
}

type BuildSeriesParams = AggregateParams & {
  chartType: ChartType | undefined
}

type BuildPieParams = AggregateParams & {
  topN?: number
}

export type CategoryPieDatum = {
  color: string
  id: CategoryId
  isOther?: boolean
  name: string
  value: number
}

type AggregatedTotals = {
  /** displayCategoryId -> total over the full range (positive amounts only kept in `orderedCategoryIds`). */
  categoryTotals: Record<CategoryId, number>
  /** Category ids with a positive total, sorted by total descending. */
  orderedCategoryIds: CategoryId[]
  /** For each interval: displayCategoryId -> trnIds that fell into it. */
  perIntervalByCategory: Record<CategoryId, TrnId[]>[]
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

/**
 * Single source of truth for category breakdown numbers.
 * Buckets transactions per interval by display category, then sums each
 * category's total across the whole range. Transfers and out-of-filter
 * categories are excluded. Both the bar/line series and the pie slices are
 * derived from this so their numbers always agree.
 */
export function aggregateCategoryTotals({
  categoriesItems,
  computeTotalForTrnsIds,
  filterCategoriesIds,
  intervals,
  isGrouped,
  trnsItems,
  type,
}: AggregateParams): AggregatedTotals {
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

  return { categoryTotals, orderedCategoryIds, perIntervalByCategory }
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
}: BuildSeriesParams): ChartSeries[] {
  const { orderedCategoryIds, perIntervalByCategory } = aggregateCategoryTotals({
    categoriesItems,
    computeTotalForTrnsIds,
    filterCategoriesIds,
    intervals,
    isGrouped,
    trnsItems,
    type,
  })

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

/**
 * Pie slices for the "by categories" donut: top-N categories by total,
 * descending, with the remainder rolled up into a single neutral "Other"
 * slice (labeled with the `otherLabel` argument). Numbers come from the same
 * aggregation as the bar series.
 */
export function buildCategoriesPieData(
  { categoriesItems, computeTotalForTrnsIds, filterCategoriesIds, intervals, isGrouped, topN = DEFAULT_PIE_TOP_N, trnsItems, type }: BuildPieParams,
  otherLabel: string,
): CategoryPieDatum[] {
  const { categoryTotals, orderedCategoryIds } = aggregateCategoryTotals({
    categoriesItems,
    computeTotalForTrnsIds,
    filterCategoriesIds,
    intervals,
    isGrouped,
    trnsItems,
    type,
  })

  const top = orderedCategoryIds.slice(0, topN).map((catId): CategoryPieDatum => {
    const category = categoriesItems[catId]
    return {
      color: category?.color ?? OTHER_SLICE_COLOR,
      id: catId,
      name: category?.name ?? catId,
      value: categoryTotals[catId]!,
    }
  })

  const restIds = orderedCategoryIds.slice(topN)
  if (restIds.length === 0)
    return top

  const otherValue = restIds.reduce((acc, id) => acc + categoryTotals[id]!, 0)
  return [
    ...top,
    {
      color: OTHER_SLICE_COLOR,
      id: OTHER_SLICE_ID,
      isOther: true,
      name: otherLabel,
      value: otherValue,
    },
  ]
}
