import { describe, expect, it } from 'vitest'

import type { StatFeedScope } from '~/components/stat/types'

import { isSameStatFeedScope } from '~/components/stat/statFeed'

const scope: StatFeedScope = {
  childCategoryId: undefined,
  date: {
    customDate: false,
    granularityBy: 'day',
    granularityDuration: 1,
    isShowMaxRange: false,
    isSkipEmpty: false,
    rangeBy: 'month',
    rangeDuration: 1,
    rangeOffset: 0,
    rangePanOffset: 0,
  },
  filteredType: 'net',
  parentCategoriesIds: ['parent-a'],
  reportType: 'combined',
  selectedCategoriesIds: ['category-a', 'category-b'],
  selectedWalletsIds: ['wallet-a', 'wallet-b'],
}

describe('isSameStatFeedScope', () => {
  it('ignores ID ordering without mutating source arrays', () => {
    const selectedCategoriesIds = ['category-b', 'category-a']
    expect(
      isSameStatFeedScope(scope, {
        ...scope,
        selectedCategoriesIds,
        selectedWalletsIds: ['wallet-b', 'wallet-a'],
      }),
    ).toBe(true)
    expect(selectedCategoriesIds).toEqual(['category-b', 'category-a'])
  })

  it.each([
    ['childCategoryId', 'child'],
    ['filteredType', 'expense'],
    ['reportType', 'income'],
  ] as const)('detects a changed %s field', (field, value) => {
    expect(isSameStatFeedScope(scope, { ...scope, [field]: value })).toBe(false)
  })

  it('detects persistent date and filter changes', () => {
    expect(
      isSameStatFeedScope(scope, {
        ...scope,
        date: { ...scope.date, rangeOffset: 1 },
      }),
    ).toBe(false)
    expect(
      isSameStatFeedScope(scope, {
        ...scope,
        date: { ...scope.date, rangePanOffset: 1 },
      }),
    ).toBe(false)
    expect(
      isSameStatFeedScope(scope, {
        ...scope,
        selectedWalletsIds: ['wallet-c'],
      }),
    ).toBe(false)
  })
})
