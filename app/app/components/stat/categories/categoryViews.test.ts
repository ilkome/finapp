import { describe, expect, it } from 'vitest'

import { collectRoundCategoryIds } from './categoryViews'

describe('collectRoundCategoryIds', () => {
  it('includes favorite categories selected by the effective block rule', () => {
    expect(collectRoundCategoryIds({
      favoriteCategoryIds: ['favorite'],
      filteredCategoryIds: [],
      isShowFavorites: true,
      isShowRecent: false,
      recentCategoryIds: ['recent'],
    })).toEqual(['favorite'])
  })

  it('keeps category ids unique in display priority order', () => {
    expect(collectRoundCategoryIds({
      favoriteCategoryIds: ['shared', 'favorite'],
      filteredCategoryIds: ['filtered', 'shared'],
      isShowFavorites: true,
      isShowRecent: true,
      preCategoryIds: ['preset', 'shared'],
      recentCategoryIds: ['recent', 'favorite'],
    })).toEqual(['preset', 'shared', 'favorite', 'recent', 'filtered'])
  })
})
