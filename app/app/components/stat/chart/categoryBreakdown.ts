import type { Categories, CategoryId } from '~/components/categories/types'
import type { ChartType } from '~/components/stat/chart/types'
import type { ChartSeries, IntervalData, SeriesSlugSelected } from '~/components/stat/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { getParentCategoryIdOrUndefined, isSystemCategoryId } from '~/components/categories/utils'
import { partitionHighlightedItems } from '~/components/stat/chart/highlightedItems'
import { resolveEChartsSeriesType } from '~/components/stat/chart/types'

type AggregateParams = {
  categoriesItems: Categories
  computeTotalForTrnsIds: (ids: TrnId[]) => { expense: number, income: number, net: number }
  /** Categories dropped from the breakdown (dashboard "exclude from stats"); undefined when a drill/filter is active. */
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  filterCategoriesIds?: CategoryId[]
  intervals: IntervalData[]
  isGrouped: boolean
  trnsItems: Record<TrnId, Pick<TrnItem, 'categoryId'>>
  type: SeriesSlugSelected
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
  /** displayCategoryId -> total over the full range. */
  categoryTotals: Record<CategoryId, number>
  /** Category ids with a non-zero total, sorted by absolute total descending. */
  orderedCategoryIds: CategoryId[]
  /** For each interval: displayCategoryId -> trnIds that fell into it. */
  perIntervalByCategory: Record<CategoryId, TrnId[]>[]
}

const OTHER_CATEGORY_COLOR = 'var(--ui-text-dimmed)'

function getCategoryValue(
  total: { expense: number, income: number, net: number },
  type: SeriesSlugSelected,
): number {
  return type === 'net' ? total.net : total[type]
}

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
      const value = getCategoryValue(computeTotalForTrnsIds(trnIds), type)
      categoryTotals[catId] = (categoryTotals[catId] ?? 0) + value
    }
  }

  // Net income keeps its sign for axis charts, while category priority follows magnitude.
  const orderedCategoryIds = Object.keys(categoryTotals)
    .filter(id => categoryTotals[id] !== 0)
    .sort((a, b) => Math.abs(categoryTotals[b]!) - Math.abs(categoryTotals[a]!))

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
  const axisChartType = resolveEChartsSeriesType(chartType === 'pie' ? 'bar' : chartType)
  const { categoryTotals, orderedCategoryIds, perIntervalByCategory } = aggregateCategoryTotals({
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
      getCategoryValue(computeTotalForTrnsIds(trnIds), type),
    ]),
  ) as Record<CategoryId, number>)
  const { highlighted, remainder } = partitionHighlightedItems({
    getMagnitude: item => item.value,
    items: orderedCategoryIds.map(id => ({ id, value: categoryTotals[id] ?? 0 })),
  })
  const highlightedCategoryIds = highlighted.map(item => item.id)
  const remainderSet = new Set(remainder.map(item => item.id))

  const series = highlightedCategoryIds.map((catId): ChartSeries => {
    const category = categoriesItems[catId]
    const values = valuesByInterval.map(values => values[catId] ?? 0)
    return {
      color: resolveCategoryColor(categoriesItems, catId),
      data: values.map(value => Math.abs(value)),
      icon: category?.icon,
      name: category?.name ?? catId,
      showValueType: type === 'net',
      type: axisChartType,
      valueTypes: type === 'net'
        ? values.map(value => value === 0 ? undefined : value < 0 ? 'expense' : 'income')
        : values.map(value => value === 0 ? undefined : type),
    }
  })

  const signedOtherData = valuesByInterval.map(values => Object.entries(values)
    .filter(([categoryId]) => remainderSet.has(categoryId))
    .reduce((total, [, value]) => total + value, 0))
  if (signedOtherData.some(value => value !== 0)) {
    series.push({
      color: OTHER_CATEGORY_COLOR,
      data: signedOtherData.map(value => Math.abs(value)),
      icon: 'lucide:ellipsis',
      name: otherName,
      showValueType: type === 'net',
      type: axisChartType,
      valueTypes: type === 'net'
        ? signedOtherData.map(value => value === 0 ? undefined : value < 0 ? 'expense' : 'income')
        : signedOtherData.map(value => value === 0 ? undefined : type),
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

  const { highlighted, remainder } = partitionHighlightedItems({
    getMagnitude: item => item.value,
    items: orderedCategoryIds.map(id => ({ id, value: categoryTotals[id] ?? 0 })),
  })
  const highlightedData = highlighted
    .map((item): CategoryPieDatum => ({
      color: resolveCategoryColor(categoriesItems, item.id),
      value: Math.abs(item.value),
    }))
  const otherValue = remainder.reduce((total, item) => total + Math.abs(item.value), 0)

  return otherValue > 0
    ? [...highlightedData, { color: OTHER_CATEGORY_COLOR, value: otherValue }]
    : highlightedData
}
