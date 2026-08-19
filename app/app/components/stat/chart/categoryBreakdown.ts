import type { Categories, CategoryId } from '~/components/categories/types'
import type { ChartType } from '~/components/stat/chart/types'
import type { ChartSeries, IntervalData, SeriesSlug } from '~/components/stat/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { getParentCategoryIdOrUndefined, isSystemCategoryId } from '~/components/categories/utils'

type AggregateParams = {
  categoriesItems: Categories
  computeTotalForTrnsIds: (ids: TrnId[]) => { expense: number, income: number, sum: number }
  /** Categories dropped from the breakdown (dashboard "exclude from stats"); undefined when a drill/filter is active. */
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  filterCategoriesIds?: CategoryId[]
  intervals: IntervalData[]
  isGrouped: boolean
  trnsItems: Record<TrnId, Pick<TrnItem, 'categoryId'>>
  type: SeriesSlug
}

type BuildSeriesParams = AggregateParams & {
  chartType: ChartType | undefined
  otherName?: string
}

export type CategoryPieDatum = {
  color: string
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

const HIGHLIGHTED_CATEGORIES_COUNT = 5
const OTHER_CATEGORY_COLOR = 'var(--ui-text-dimmed)'

function resolveCategoryColor(categoriesItems: Categories, categoryId: CategoryId): string {
  return categoriesItems[categoryId]?.color ?? OTHER_CATEGORY_COLOR
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
 * category's total across the whole range. System categories (transfer,
 * adjustment) and out-of-filter categories are excluded. Both the bar/line series and focused donut are
 * derived from this so their numbers always agree.
 */
export function aggregateCategoryTotals({
  categoriesItems,
  computeTotalForTrnsIds,
  excludedCategoriesIds,
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
      if (!rawCategoryId || isSystemCategoryId(rawCategoryId))
        continue
      if (excludedCategoriesIds?.has(rawCategoryId))
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
  excludedCategoriesIds,
  filterCategoriesIds,
  intervals,
  isGrouped,
  otherName = 'Other',
  trnsItems,
  type,
}: BuildSeriesParams): ChartSeries[] {
  const axisChartType = chartType === 'line' ? 'line' : 'bar'
  const { orderedCategoryIds, perIntervalByCategory } = aggregateCategoryTotals({
    categoriesItems,
    computeTotalForTrnsIds,
    excludedCategoriesIds,
    filterCategoriesIds,
    intervals,
    isGrouped,
    trnsItems,
    type,
  })

  const valuesByInterval = perIntervalByCategory.map(bucket => Object.fromEntries(
    Object.entries(bucket).map(([categoryId, trnIds]) => [
      categoryId,
      computeTotalForTrnsIds(trnIds)[type],
    ]),
  ) as Record<CategoryId, number>)
  const highlightedIdsByInterval = valuesByInterval.map(values => Object.entries(values)
    .filter(([, value]) => value > 0)
    .sort(([, valueA], [, valueB]) => valueB - valueA)
    .slice(0, HIGHLIGHTED_CATEGORIES_COUNT)
    .map(([categoryId]) => categoryId))
  const highlightedSets = highlightedIdsByInterval.map(ids => new Set(ids))
  const highlightedCategoryIds = orderedCategoryIds.filter(categoryId =>
    highlightedSets.some(ids => ids.has(categoryId)),
  )

  const series = highlightedCategoryIds.map((catId): ChartSeries => {
    const category = categoriesItems[catId]
    return {
      color: resolveCategoryColor(categoriesItems, catId),
      data: valuesByInterval.map((values, index) =>
        highlightedSets[index]!.has(catId) ? (values[catId] ?? 0) : 0,
      ),
      icon: category?.icon,
      name: category?.name ?? catId,
      type: axisChartType,
    }
  })

  const otherData = valuesByInterval.map((values, index) => Object.entries(values)
    .filter(([categoryId]) => !highlightedSets[index]!.has(categoryId))
    .reduce((total, [, value]) => total + value, 0))
  if (otherData.some(value => value > 0)) {
    series.push({
      color: OTHER_CATEGORY_COLOR,
      data: otherData,
      icon: 'lucide:ellipsis',
      name: otherName,
      type: axisChartType,
    })
  }

  return series
}

/**
 * Focused-donut slices, derived from the same aggregation as the bar series.
 */
export function buildCategoriesPieData(
  { categoriesItems, computeTotalForTrnsIds, excludedCategoriesIds, filterCategoriesIds, intervals, isGrouped, trnsItems, type }: AggregateParams,
): CategoryPieDatum[] {
  const { categoryTotals, orderedCategoryIds } = aggregateCategoryTotals({
    categoriesItems,
    computeTotalForTrnsIds,
    excludedCategoriesIds,
    filterCategoriesIds,
    intervals,
    isGrouped,
    trnsItems,
    type,
  })

  const highlightedData = orderedCategoryIds
    .slice(0, HIGHLIGHTED_CATEGORIES_COUNT)
    .map((catId): CategoryPieDatum => ({
      color: resolveCategoryColor(categoriesItems, catId),
      value: categoryTotals[catId]!,
    }))
  const otherValue = orderedCategoryIds
    .slice(HIGHLIGHTED_CATEGORIES_COUNT)
    .reduce((total, catId) => total + categoryTotals[catId]!, 0)

  return otherValue > 0
    ? [...highlightedData, { color: OTHER_CATEGORY_COLOR, value: otherValue }]
    : highlightedData
}
