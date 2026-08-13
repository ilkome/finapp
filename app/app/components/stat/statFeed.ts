import type { Range } from '~~/utils/date/types'

import { isEqual } from 'es-toolkit'

import type { BuildStatFeedIndexOptions, StatFeedIndex, StatFeedLocalFilter, StatFeedPeriod, StatFeedScope, StatPeriodRow, StatPeriodTransitionDirection, StatPeriodTransitionSource, StatPeriodTransitionState, StatVirtualRow, StatVisibleItem } from '~/components/stat/types'
import type { TrnId, Trns } from '~/components/trns/types'

import { buildTrnsDisplayRows } from '~/components/trns/listRows'
import { matchesTrnViewType } from '~/components/trns/tabClassification'

type EmptyTransactionsKey = 'trns.noExpenses' | 'trns.noIncome' | 'trns.noTrns'

function uniqueSortedOffsets(offsets: readonly number[]): number[] {
  return [...new Set(offsets)].sort((left, right) => left - right)
}

function matchesLocalFilter(items: Trns, id: TrnId, filter: StatFeedLocalFilter): boolean {
  const trn = items[id]
  return matchesTrnViewType(trn, filter.filterBy)
    && (!filter.showWithDesc || !!trn?.desc)
}

function sortIds(ids: readonly string[]) {
  return [...ids].sort()
}

export function mergeStatOffsets(current: readonly number[], additions: readonly number[]) {
  const offsets = uniqueSortedOffsets([...current, ...additions])
  const changed = offsets.length !== current.length || offsets.some((offset, index) => offset !== current[index])
  return {
    changed,
    offsets: changed ? offsets : current,
  }
}

export function buildStatVirtualRows(
  periods: readonly StatFeedPeriod[],
  items: Trns | null | undefined,
  canLoadMore: boolean,
): StatVirtualRow[] {
  const result: StatVirtualRow[] = []
  const seenTransactions = new Set<TrnId>()

  for (const period of periods) {
    result.push({
      id: `period:${period.offset}`,
      offset: period.offset,
      type: 'periodAnchor',
    })

    const uniqueIds = period.ids.filter((id) => {
      if (seenTransactions.has(id))
        return false
      seenTransactions.add(id)
      return true
    })
    result.push(...buildTrnsDisplayRows(uniqueIds, items)
      .map(row => ({ ...row, offset: period.offset })))
  }

  result.push(canLoadMore
    ? { id: 'feed:loader', type: 'loader' }
    : { id: 'feed:end', type: 'end' })
  return result
}

export function findStatPeriodOffsetForDate(
  date: number,
  baseOffset: number,
  rangeForOffset: (offset: number) => Range,
): number | null {
  const baseRange = rangeForOffset(baseOffset)
  if (date >= baseRange.start && date <= baseRange.end)
    return baseOffset
  if (date > baseRange.end)
    return null

  let previousDistance = 0
  let distance = 1
  while (date < rangeForOffset(baseOffset + distance).start) {
    previousDistance = distance
    distance *= 2
  }

  let low = baseOffset + previousDistance + 1
  let high = baseOffset + distance
  while (low <= high) {
    const middle = Math.floor((low + high) / 2)
    const range = rangeForOffset(middle)
    if (date < range.start)
      low = middle + 1
    else if (date > range.end)
      high = middle - 1
    else
      return middle
  }

  return null
}

export function buildStatFeedIndex(options: BuildStatFeedIndexOptions): StatFeedIndex {
  const items = options.items ?? {}
  const rangeCache = new Map<number, Range>()
  const rangeForOffset = (offset: number) => {
    const cached = rangeCache.get(offset)
    if (cached)
      return cached
    const range = options.rangeForOffset(offset)
    rangeCache.set(offset, range)
    return range
  }
  const baseRange = rangeForOffset(options.baseOffset)
  const frontierRange = rangeForOffset(options.searchedThroughOffset)
  const idsByOffset = new Map<number, TrnId[]>()
  let dateToOffsetLookups = 0
  let nextHistoricalId: TrnId | null = null
  let routedIds = 0
  let visitedIds = 0

  for (const id of options.candidateIds) {
    visitedIds++
    const trn = items[id]
    if (!trn || !matchesLocalFilter(items, id, options.filter))
      continue

    if (trn.date >= frontierRange.start && trn.date <= baseRange.end) {
      dateToOffsetLookups++
      const offset = findStatPeriodOffsetForDate(trn.date, options.baseOffset, rangeForOffset)
      if (offset !== null && offset <= options.searchedThroughOffset) {
        const ids = idsByOffset.get(offset)
        if (ids)
          ids.push(id)
        else
          idsByOffset.set(offset, [id])
        routedIds++
        continue
      }
    }

    if (!nextHistoricalId && trn.date >= options.minimumDate && trn.date < frontierRange.start)
      nextHistoricalId = id
  }

  return {
    idsByOffset,
    materializedOffsets: [...idsByOffset.keys()].sort((left, right) => left - right),
    metrics: {
      dateToOffsetLookups,
      periodRangeCount: rangeCache.size,
      routedIds,
      visitedIds,
    },
    nextHistoricalId,
  }
}

export function canApplyStatLoadResult(
  currentGeneration: number,
  currentLocalFilterGeneration: number,
  resultGeneration: number,
  resultLocalFilterGeneration: number,
): boolean {
  return currentGeneration === resultGeneration
    && currentLocalFilterGeneration === resultLocalFilterGeneration
}

export function shouldRequestStatHistoryLoad(options: {
  isFillingViewport: boolean
  isReconciling: boolean
  isScrolling: boolean
  reachesTerminal: boolean
  scrollDirection: 'backward' | 'forward' | null
}): boolean {
  return options.isScrolling
    && options.scrollDirection === 'forward'
    && options.reachesTerminal
    && !options.isFillingViewport
    && !options.isReconciling
}

export function resolveVisibleStatPeriodOffset(options: {
  items: readonly StatVisibleItem[]
  previousOffset: number
  rows: readonly StatPeriodRow[]
  scrollDirection?: StatPeriodTransitionDirection | null
  tolerance?: number
  visibleTop: number
}): number {
  const tolerance = options.tolerance ?? 2
  const firstVisible = options.items.find(item => item.end > options.visibleTop + tolerance)
  if (!firstVisible)
    return options.previousOffset

  const nextOffset = options.rows[firstVisible.index]?.offset
  if (nextOffset === undefined || nextOffset === options.previousOffset)
    return options.previousOffset

  if (
    (options.scrollDirection === 'forward' && nextOffset < options.previousOffset)
    || (options.scrollDirection === 'backward' && nextOffset > options.previousOffset)
  ) {
    return options.previousOffset
  }

  if (nextOffset > options.previousOffset) {
    const previousPeriodStillVisible = options.items.some(item =>
      options.rows[item.index]?.offset === options.previousOffset
      && item.end > options.visibleTop - tolerance,
    )
    if (previousPeriodStillVisible)
      return options.previousOffset
  }

  return nextOffset
}

export function resolveStatPeriodTransition(
  state: Readonly<StatPeriodTransitionState>,
  geometry: {
    direction: StatPeriodTransitionDirection | null
    items: readonly StatVisibleItem[]
    rows: readonly StatPeriodRow[]
    source: StatPeriodTransitionSource
    visibleTop: number
  },
): StatPeriodTransitionState {
  if (geometry.source !== 'scroll' || !geometry.direction)
    return state

  const activeOffset = resolveVisibleStatPeriodOffset({
    items: geometry.items,
    previousOffset: state.activeOffset,
    rows: geometry.rows,
    scrollDirection: geometry.direction,
    visibleTop: geometry.visibleTop,
  })
  if (activeOffset === state.activeOffset && geometry.direction === state.direction)
    return state

  return {
    activeOffset,
    direction: geometry.direction,
  }
}

export function resolveStatScrollRangeOffset(activeOffset: number, baseOffset: number): number | null {
  return activeOffset === baseOffset ? null : activeOffset
}

export function resolveCurrentPeriodEmptyKey(
  statTab: string,
  filteredType: string,
): EmptyTransactionsKey {
  const selectedType = statTab === 'summary' ? filteredType : statTab

  if (selectedType === 'expense')
    return 'trns.noExpenses'
  if (selectedType === 'income')
    return 'trns.noIncome'
  return 'trns.noTrns'
}

export function resolveStatFeedScrollTop(
  preservedCategoryScrollTop: number | null,
  currentScrollTop: number,
  preserveCurrentScroll: boolean,
): number | null {
  if (preservedCategoryScrollTop !== null)
    return preservedCategoryScrollTop

  return preserveCurrentScroll ? currentScrollTop : null
}

export function resolveStatStickyBottom(
  stickyTop: number,
  summaryTop: number,
  summaryBottom: number,
): number {
  return summaryTop <= stickyTop + 1 ? summaryBottom : stickyTop
}

export function canStickStatCategories(
  stickyTop: number,
  categoriesHeight: number,
  viewportHeight: number,
): boolean {
  return categoriesHeight > 0 && stickyTop + categoriesHeight <= viewportHeight
}

export function isStatCategoriesPinned(
  position: string,
  categoriesTop: number,
  stickyTop: number,
): boolean {
  return position === 'sticky' && categoriesTop <= stickyTop + 1
}

export function normalizeStatFeedScope(scope: StatFeedScope): StatFeedScope {
  return {
    ...scope,
    date: {
      ...scope.date,
      customDate: scope.date.customDate ? { ...scope.date.customDate } : false,
    },
    parentCategoriesIds: sortIds(scope.parentCategoriesIds),
    selectedCategoriesIds: sortIds(scope.selectedCategoriesIds),
    selectedWalletsIds: sortIds(scope.selectedWalletsIds),
  }
}

export function isSameStatFeedScope(left: StatFeedScope, right: StatFeedScope): boolean {
  return isEqual(normalizeStatFeedScope(left), normalizeStatFeedScope(right))
}
