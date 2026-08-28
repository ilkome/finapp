import { describe, expect, it } from 'vitest'

import { canApplyStatLoadResult, canStickStatCategories, findStatPeriodOffsetForDate, isStatCategoriesPinned, mergeStatOffsets, resolveCurrentPeriodEmptyKey, resolveStatFeedScrollTop, resolveStatPeriodTransition, resolveStatScrollRangeOffset, resolveStatStickyBottom, resolveVisibleStatPeriodOffset, shouldRequestStatHistoryLoad } from '~/components/stat/statFeed'

describe('canStickStatCategories', () => {
  it('allows sticky categories only when the complete list fits below the fixed content', () => {
    expect(canStickStatCategories(216, 360, 720)).toBe(true)
    expect(canStickStatCategories(216, 520, 720)).toBe(false)
  })
})

describe('resolveCurrentPeriodEmptyKey', () => {
  it('uses the selected summary type', () => {
    expect(resolveCurrentPeriodEmptyKey('combined', 'expense')).toBe('trns.noExpenses')
    expect(resolveCurrentPeriodEmptyKey('combined', 'income')).toBe('trns.noIncome')
    expect(resolveCurrentPeriodEmptyKey('combined', 'net')).toBe('trns.noTrns')
  })

  it('uses the active stat tab outside summary', () => {
    expect(resolveCurrentPeriodEmptyKey('expense', 'net')).toBe('trns.noExpenses')
    expect(resolveCurrentPeriodEmptyKey('income', 'net')).toBe('trns.noIncome')
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

describe('resolveStatPeriodTransition', () => {
  const rows = [{ offset: 0 }, { offset: 0 }, { offset: 1 }, { offset: 1 }]
  const forwardItems = [
    { end: 90, index: 0, start: 50 },
    { end: 130, index: 1, start: 90 },
    { end: 170, index: 2, start: 130 },
    { end: 210, index: 3, start: 170 },
  ]

  it('commits a forward crossing exactly once for repeated geometry', () => {
    const geometry = {
      direction: 'forward' as const,
      items: forwardItems,
      rows,
      source: 'scroll' as const,
      visibleTop: 135,
    }
    const first = resolveStatPeriodTransition({ activeOffset: 0, direction: null }, geometry)
    const repeated = resolveStatPeriodTransition(first, geometry)

    expect(first).toEqual({ activeOffset: 1, direction: 'forward' })
    expect(repeated).toBe(first)
  })

  it('commits a backward crossing exactly once for repeated geometry', () => {
    const geometry = {
      direction: 'backward' as const,
      items: forwardItems,
      rows,
      source: 'scroll' as const,
      visibleTop: 125,
    }
    const first = resolveStatPeriodTransition({ activeOffset: 1, direction: null }, geometry)
    const repeated = resolveStatPeriodTransition(first, geometry)

    expect(first).toEqual({ activeOffset: 0, direction: 'backward' })
    expect(repeated).toBe(first)
  })

  it('ignores alternating summary geometry without a page scroll', () => {
    const state = { activeOffset: 1, direction: 'forward' as const }
    const resized = resolveStatPeriodTransition(state, {
      direction: null,
      items: forwardItems,
      rows,
      source: 'resize',
      visibleTop: 125,
    })
    const measured = resolveStatPeriodTransition(resized, {
      direction: null,
      items: forwardItems,
      rows,
      source: 'measurement',
      visibleTop: 145,
    })

    expect(resized).toBe(state)
    expect(measured).toBe(state)
  })

  it('accepts a genuine direction reversal immediately', () => {
    expect(resolveStatPeriodTransition({ activeOffset: 1, direction: 'forward' }, {
      direction: 'backward',
      items: forwardItems,
      rows,
      source: 'scroll',
      visibleTop: 125,
    })).toEqual({ activeOffset: 0, direction: 'backward' })
  })
})

describe('resolveStatScrollRangeOffset', () => {
  it('clears the passive offset when the base period becomes active', () => {
    expect(resolveStatScrollRangeOffset(0, 0)).toBeNull()
    expect(resolveStatScrollRangeOffset(2, 0)).toBe(2)
  })
})

describe('mergeStatOffsets', () => {
  it('preserves the current reference when additions are a no-op', () => {
    const current = [0, 2, 4]
    const result = mergeStatOffsets(current, [4, 2])

    expect(result).toEqual({ changed: false, offsets: current })
    expect(result.offsets).toBe(current)
  })

  it('returns an ordered array when an offset is added', () => {
    expect(mergeStatOffsets([0, 4], [2])).toEqual({ changed: true, offsets: [0, 2, 4] })
  })
})
