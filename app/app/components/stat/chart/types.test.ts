import { describe, expect, it } from 'vitest'

import { resolveEffectiveChartType } from '~/components/stat/chart/types'

describe('resolveEffectiveChartType', () => {
  it.each([
    { hasExpense: true, hasIncome: false },
    { hasExpense: false, hasIncome: true },
  ])('temporarily replaces pie with bars for one cashflow type', ({ hasExpense, hasIncome }) => {
    expect(resolveEffectiveChartType({
      activeCategoryCount: 2,
      configuredType: 'pie',
      hasExpense,
      hasIncome,
      hasQuickCategoryFilter: true,
    })).toBe('bar')
  })

  it('keeps pie when the selected category has both cashflow types', () => {
    expect(resolveEffectiveChartType({
      activeCategoryCount: 2,
      configuredType: 'pie',
      hasExpense: true,
      hasIncome: true,
      hasQuickCategoryFilter: true,
    })).toBe('pie')
  })

  it('restores pie when the quick category filter is cleared', () => {
    expect(resolveEffectiveChartType({
      activeCategoryCount: 2,
      configuredType: 'pie',
      hasExpense: true,
      hasIncome: false,
      hasQuickCategoryFilter: false,
    })).toBe('pie')
  })

  it('temporarily replaces pie with bars when period and wallet filters leave one category', () => {
    expect(resolveEffectiveChartType({
      activeCategoryCount: 1,
      configuredType: 'pie',
      hasExpense: true,
      hasIncome: true,
      hasQuickCategoryFilter: false,
    })).toBe('bar')
  })

  it('does not override a configured axis chart', () => {
    expect(resolveEffectiveChartType({
      activeCategoryCount: 1,
      configuredType: 'line',
      hasExpense: true,
      hasIncome: false,
      hasQuickCategoryFilter: true,
    })).toBe('line')
  })
})
