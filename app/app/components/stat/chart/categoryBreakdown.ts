import type { Categories, CategoryId } from '~/components/categories/types'
import type { ChartType } from '~/components/stat/chart/types'
import type { CategoryGrouping } from '~/components/stat/config/schema'
import type { ChartSeries, IntervalData, SeriesSlugSelected } from '~/components/stat/types'
import type { TrnId, TrnItem } from '~/components/trns/types'

import { getParentCategoryIdOrUndefined } from '~/components/categories/utils'
import { partitionHighlightedItems } from '~/components/stat/chart/highlightedItems'
import { resolveEChartsSeriesType } from '~/components/stat/chart/types'

type AggregateParams = {
  categoriesItems: Categories
  computeTotalForTrnsIds: (ids: TrnId[]) => { expense: number, income: number, net: number }
  /** Categories dropped from the breakdown (dashboard "exclude from stats"); undefined when a drill/filter is active. */
  excludedCategoriesIds?: ReadonlySet<CategoryId>
  filterCategoriesIds?: CategoryId[]
  grouping: CategoryGrouping
  intervals: IntervalData[]
  trnsItems: Record<TrnId, Pick<TrnItem, 'categoryId'>>
}

type BuildSeriesParams = AggregateParams & {
  chartType: ChartType | undefined
  otherName?: string
  type: SeriesSlugSelected
}

type CategoryTotal = { expense: number, income: number, net: number }

export type CategoryPieDatum = {
  color: string
  value: number
}

export type AggregatedTotals = {
  /** For each interval: displayCategoryId -> its totals in that interval. */
  perIntervalTotals: Record<CategoryId, CategoryTotal>[]
}

type CategoryValues = {
  /** displayCategoryId -> total over the full range. */
  categoryTotals: Record<CategoryId, number>
  /** Category ids with a non-zero total, sorted by absolute total descending. */
  orderedCategoryIds: CategoryId[]
  /** For each interval: displayCategoryId -> value. */
  perIntervalValues: Record<CategoryId, number>[]
}

const OTHER_CATEGORY_COLOR = 'var(--ui-text-dimmed)'

function resolveCategoryColor(categoriesItems: Categories, categoryId: CategoryId): string {
  return categoriesItems[categoryId]?.color ?? OTHER_CATEGORY_COLOR
}

/**
 * Parents that contribute exactly one active leaf in `auto` grouping: collapsing those into
 * the parent would only rename the slice, so the leaf is shown instead. Same rule as the
 * category cloud and list (see resolveCategoryGrouping).
 */
function collectExpandedParentIds(leafIds: Iterable<CategoryId>, categoriesItems: Categories): Set<CategoryId> {
  const leavesByParent = new Map<CategoryId, Set<CategoryId>>()
  for (const leafId of leafIds) {
    const parentId = getParentCategoryIdOrUndefined(categoriesItems, leafId)
    if (!parentId)
      continue
    const leaves = leavesByParent.get(parentId) ?? new Set<CategoryId>()
    leaves.add(leafId)
    leavesByParent.set(parentId, leaves)
  }
  return new Set([...leavesByParent].filter(([, leaves]) => leaves.size === 1).map(([parentId]) => parentId))
}

function resolveCategoryId(
  trnCategoryId: CategoryId | undefined,
  categoriesItems: Categories,
  grouping: CategoryGrouping,
  expandedParentIds: ReadonlySet<CategoryId>,
): CategoryId | undefined {
  if (!trnCategoryId)
    return undefined
  if (grouping === 'child')
    return trnCategoryId
  const parentId = getParentCategoryIdOrUndefined(categoriesItems, trnCategoryId)
  if (!parentId)
    return trnCategoryId
  return grouping === 'auto' && expandedParentIds.has(parentId) ? trnCategoryId : parentId
}

/**
 * Single source of truth for category breakdown numbers.
 * Buckets transactions per interval by display category, then sums each
 * category's totals once per bucket. System categories (transfer, adjustment) and
 * out-of-filter categories are excluded. The bar/line series and the donuts all pick their
 * values from this so their numbers always agree.
 */
export function aggregateCategoryTotals({
  categoriesItems,
  computeTotalForTrnsIds,
  excludedCategoriesIds,
  filterCategoriesIds,
  grouping,
  intervals,
  trnsItems,
}: AggregateParams): AggregatedTotals {
  const filterSet = filterCategoriesIds?.length ? new Set(filterCategoriesIds) : undefined
  const isIncluded = (categoryId: CategoryId | undefined): categoryId is CategoryId => (
    !!categoryId
    && !excludedCategoriesIds?.has(categoryId)
    && (!filterSet || filterSet.has(categoryId))
  )
  const expandedParentIds = grouping === 'auto'
    ? collectExpandedParentIds(
        new Set(intervals.flatMap(interval => interval.trnsIds
          .map(trnId => trnsItems[trnId]?.categoryId)
          .filter(isIncluded))),
        categoriesItems,
      )
    : new Set<CategoryId>()

  // For each interval, build a map of displayCategoryId -> trnIds[]
  const perIntervalTotals = intervals.map((interval) => {
    const bucket: Record<CategoryId, TrnId[]> = {}
    for (const trnId of interval.trnsIds) {
      const rawCategoryId = trnsItems[trnId]?.categoryId
      if (!isIncluded(rawCategoryId))
        continue

      const displayId = resolveCategoryId(rawCategoryId, categoriesItems, grouping, expandedParentIds)
      if (!displayId)
        continue

      bucket[displayId] ??= []
      bucket[displayId].push(trnId)
    }
    const totals: Record<CategoryId, CategoryTotal> = {}
    for (const [categoryId, trnIds] of Object.entries(bucket)) {
      const { expense, income, net } = computeTotalForTrnsIds(trnIds)
      totals[categoryId] = { expense, income, net }
    }
    return totals
  })

  return { perIntervalTotals }
}

export function pickCategoryValues({ perIntervalTotals }: AggregatedTotals, type: SeriesSlugSelected): CategoryValues {
  const categoryTotals: Record<CategoryId, number> = {}
  const perIntervalValues = perIntervalTotals.map((totals) => {
    const values: Record<CategoryId, number> = {}
    for (const [categoryId, total] of Object.entries(totals)) {
      values[categoryId] = total[type]
      categoryTotals[categoryId] = (categoryTotals[categoryId] ?? 0) + total[type]
    }
    return values
  })

  // Net income keeps its sign for axis charts, while category priority follows magnitude.
  const orderedCategoryIds = Object.keys(categoryTotals)
    .filter(id => categoryTotals[id] !== 0)
    .sort((a, b) => Math.abs(categoryTotals[b]!) - Math.abs(categoryTotals[a]!))

  return { categoryTotals, orderedCategoryIds, perIntervalValues }
}

export function buildCategoriesSeries({
  categoriesItems,
  chartType,
  computeTotalForTrnsIds,
  excludedCategoriesIds,
  filterCategoriesIds,
  grouping,
  intervals,
  otherName = 'Other',
  trnsItems,
  type,
}: BuildSeriesParams): ChartSeries[] {
  const axisChartType = resolveEChartsSeriesType(chartType === 'pie' ? 'bar' : chartType)
  const { categoryTotals, orderedCategoryIds, perIntervalValues: valuesByInterval } = pickCategoryValues(aggregateCategoryTotals({
    categoriesItems,
    computeTotalForTrnsIds,
    excludedCategoriesIds,
    filterCategoriesIds,
    grouping,
    intervals,
    trnsItems,
  }), type)
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
export function buildCategoriesPieData({ aggregated, categoriesItems, type }: {
  aggregated: AggregatedTotals
  categoriesItems: Categories
  type: SeriesSlugSelected
}): CategoryPieDatum[] {
  const { categoryTotals, orderedCategoryIds } = pickCategoryValues(aggregated, type)

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
