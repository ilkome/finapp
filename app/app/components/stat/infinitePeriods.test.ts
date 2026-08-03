import { describe, expect, it } from 'vitest'

import { canStickStatCategories, filterAvailableTrnIds, hasUnloadedTrnIds, isStatCategoriesPinned, isStatTrnsNearEnd, resolveCurrentPeriodEmptyKey, resolveStatStickyBottom } from '~/components/stat/infinitePeriods'

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
