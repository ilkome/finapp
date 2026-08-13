import type { Range } from '~~/utils/date/types'

import type { TrnsDisplayRow } from '~/components/trns/listRows'
import type { TrnId, Trns } from '~/components/trns/types'

import { buildTrnsDisplayRows } from '~/components/trns/listRows'

type EmptyTransactionsKey = 'trns.noExpenses' | 'trns.noIncome' | 'trns.noTrns'

export type StatVisibleItem = {
  end: number
  index: number
  start: number
}

export type StatPeriodRow = {
  id?: string
  offset?: number
}

export type StatVirtualRow
  = | { id: string, offset: number, type: 'periodAnchor' }
    | (TrnsDisplayRow & { offset: number })
    | { id: string, type: 'loader' }
    | { id: string, type: 'end' }

type StatPeriod = {
  ids: TrnId[]
  offset: number
}

export function canStickStatCategories(
  stickyTop: number,
  categoriesHeight: number,
  viewportHeight: number,
): boolean {
  return categoriesHeight > 0 && stickyTop + categoriesHeight <= viewportHeight
}

export function filterAvailableTrnIds(periodIds: TrnId[], availableIds: TrnId[]): TrnId[] {
  const availableSet = new Set(availableIds)
  return periodIds.filter(id => availableSet.has(id))
}

export function hasUnloadedTrnIds(availableIds: TrnId[], loadedIds: TrnId[]): boolean {
  const loadedSet = new Set(loadedIds)
  return availableIds.some(id => !loadedSet.has(id))
}

export function uniqueSortedOffsets(offsets: readonly number[]): number[] {
  return [...new Set(offsets)].sort((left, right) => left - right)
}

export function buildStatVirtualRows(
  periods: readonly StatPeriod[],
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

export function collectMaterializedStatOffsets(
  dates: readonly number[],
  baseOffset: number,
  searchedThroughOffset: number,
  rangeForOffset: (offset: number) => Range,
): number[] {
  return uniqueSortedOffsets(dates.flatMap((date) => {
    const offset = findStatPeriodOffsetForDate(date, baseOffset, rangeForOffset)
    return offset !== null && offset >= baseOffset && offset <= searchedThroughOffset ? [offset] : []
  }))
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
  scrollDirection?: 'backward' | 'forward' | null
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

export function isStatCategoriesPinned(
  position: string,
  categoriesTop: number,
  stickyTop: number,
): boolean {
  return position === 'sticky' && categoriesTop <= stickyTop + 1
}

export function isStatTrnsNearEnd(
  scrollTop: number,
  viewportHeight: number,
  scrollHeight: number,
  threshold = 600,
): boolean {
  return scrollTop + viewportHeight >= scrollHeight - threshold
}
