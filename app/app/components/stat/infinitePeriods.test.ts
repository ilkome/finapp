import { describe, expect, it } from 'vitest'

import { canApplyStatLoadResult, canStickStatCategories, filterAvailableTrnIds, findStatPeriodOffsetForDate, hasUnloadedTrnIds, isStatCategoriesPinned, isStatTrnsNearEnd, resolveCurrentPeriodEmptyKey, resolveStatFeedScrollTop, resolveStatStickyBottom, resolveVisibleStatPeriodOffset, shouldRequestStatHistoryLoad, uniqueSortedOffsets } from '~/components/stat/infinitePeriods'

describe('canStickStatCategories', () => {
  it('allows sticky categories only when the complete list fits below the fixed content', () => {
    expect(canStickStatCategories(216, 360, 720)).toBe(true)
    expect(canStickStatCategories(216, 520, 720)).toBe(false)
  })
})

describe('filterAvailableTrnIds', () => {
  it('returns no transactions when the active filter has no matches', () => {
    expect(filterAvailableTrnIds(['expense-1'], [])).toEqual([])
  })
})

describe('hasUnloadedTrnIds', () => {
  it('stops loading when every matching transaction is already shown', () => {
    expect(hasUnloadedTrnIds(['income-1'], ['income-1'])).toBe(false)
  })

  it('continues loading while a matching transaction is still hidden', () => {
    expect(hasUnloadedTrnIds(['income-1'], [])).toBe(true)
  })
})

describe('resolveCurrentPeriodEmptyKey', () => {
  it('uses the selected summary type', () => {
    expect(resolveCurrentPeriodEmptyKey('summary', 'expense')).toBe('trns.noExpenses')
    expect(resolveCurrentPeriodEmptyKey('summary', 'income')).toBe('trns.noIncome')
    expect(resolveCurrentPeriodEmptyKey('summary', 'netIncome')).toBe('trns.noTrns')
  })

  it('uses the active stat tab outside summary', () => {
    expect(resolveCurrentPeriodEmptyKey('expense', 'netIncome')).toBe('trns.noExpenses')
    expect(resolveCurrentPeriodEmptyKey('income', 'netIncome')).toBe('trns.noIncome')
  })
})

describe('resolveStatFeedScrollTop', () => {
  it('preserves the current position when a transaction tab changes', () => {
    expect(resolveStatFeedScrollTop(null, 840, true)).toBe(840)
  })

  it('keeps the category position when both preservation modes apply', () => {
    expect(resolveStatFeedScrollTop(720, 840, true)).toBe(720)
  })

  it('allows report changes to reset the page', () => {
    expect(resolveStatFeedScrollTop(null, 840, false)).toBeNull()
  })
})

describe('resolveStatStickyBottom', () => {
  it('uses the header height until the summary becomes sticky', () => {
    expect(resolveStatStickyBottom(48, 120, 220)).toBe(48)
  })

  it('uses the sticky summary bottom once it reaches the header', () => {
    expect(resolveStatStickyBottom(48, 48, 148)).toBe(148)
  })
})

describe('isStatCategoriesPinned', () => {
  it('detects a categories list that has reached its sticky position', () => {
    expect(isStatCategoriesPinned('sticky', 216, 216)).toBe(true)
    expect(isStatCategoriesPinned('sticky', 360, 216)).toBe(false)
    expect(isStatCategoriesPinned('static', 216, 216)).toBe(false)
  })
})

describe('isStatTrnsNearEnd', () => {
  it('requests more rows whenever the restored viewport is near the list end', () => {
    expect(isStatTrnsNearEnd(900, 720, 2100)).toBe(true)
    expect(isStatTrnsNearEnd(100, 720, 2100)).toBe(false)
  })
})

describe('findStatPeriodOffsetForDate', () => {
  const period = 100
  const rangeForBase = (baseOffset: number) => (offset: number) => ({
    end: 10_000 - (offset - baseOffset) * period,
    start: 10_000 - (offset - baseOffset + 1) * period + 1,
  })

  it.each([
    [-2, 19],
    [-1, 36],
    [0, 200],
    [4, 19],
  ])('resolves a transaction after a large gap from base offset %i', (baseOffset, distance) => {
    const targetOffset = baseOffset + distance
    const targetDate = rangeForBase(baseOffset)(targetOffset).start
    expect(findStatPeriodOffsetForDate(targetDate, baseOffset, rangeForBase(baseOffset))).toBe(targetOffset)
  })

  it('uses the same resolver for every exponential and binary-search step', () => {
    const calls: number[] = []
    const resolver = (offset: number) => {
      calls.push(offset)
      return rangeForBase(0)(offset)
    }
    expect(findStatPeriodOffsetForDate(rangeForBase(0)(36).end, 0, resolver)).toBe(36)
    expect(calls.length).toBeGreaterThan(2)
  })
})

describe('loader guards', () => {
  it('rejects a stale report or local-filter generation', () => {
    expect(canApplyStatLoadResult(2, 4, 1, 4)).toBe(false)
    expect(canApplyStatLoadResult(2, 4, 2, 3)).toBe(false)
    expect(canApplyStatLoadResult(2, 4, 2, 4)).toBe(true)
  })

  it('loads only for active forward user scrolling near the terminal row', () => {
    const base = {
      isFillingViewport: false,
      isReconciling: false,
      isScrolling: true,
      reachesTerminal: true,
      scrollDirection: 'forward' as const,
    }
    expect(shouldRequestStatHistoryLoad(base)).toBe(true)
    expect(shouldRequestStatHistoryLoad({ ...base, scrollDirection: 'backward' })).toBe(false)
    expect(shouldRequestStatHistoryLoad({ ...base, isScrolling: false })).toBe(false)
    expect(shouldRequestStatHistoryLoad({ ...base, isReconciling: true })).toBe(false)
    expect(shouldRequestStatHistoryLoad({ ...base, isFillingViewport: true })).toBe(false)
  })
})

describe('resolveVisibleStatPeriodOffset', () => {
  const rows = [{ offset: 0 }, { offset: 0 }, { offset: 1 }, { offset: 1 }]
  const items = [
    { end: 90, index: 0, start: 50 },
    { end: 130, index: 1, start: 90 },
    { end: 170, index: 2, start: 130 },
    { end: 210, index: 3, start: 170 },
  ]

  it('selects the first actually visible item instead of the overscan start', () => {
    expect(resolveVisibleStatPeriodOffset({ items, previousOffset: 0, rows, visibleTop: 135 })).toBe(1)
  })

  it('keeps the previous period inside the boundary tolerance', () => {
    expect(resolveVisibleStatPeriodOffset({ items, previousOffset: 0, rows, visibleTop: 129 })).toBe(0)
  })

  it('switches back when a newer period crosses the boundary', () => {
    expect(resolveVisibleStatPeriodOffset({ items, previousOffset: 1, rows, visibleTop: 125 })).toBe(0)
  })

  it('does not reverse a forward period change after summary geometry changes', () => {
    expect(resolveVisibleStatPeriodOffset({
      items,
      previousOffset: 1,
      rows,
      scrollDirection: 'forward',
      visibleTop: 125,
    })).toBe(1)
  })

  it('does not reverse a backward period change after summary geometry changes', () => {
    expect(resolveVisibleStatPeriodOffset({
      items,
      previousOffset: 0,
      rows,
      scrollDirection: 'backward',
      visibleTop: 135,
    })).toBe(0)
  })
})

describe('uniqueSortedOffsets', () => {
  it('keeps loaded ranges ordered and unique', () => {
    expect(uniqueSortedOffsets([3, 1, 2, 3, 1])).toEqual([1, 2, 3])
  })
})
