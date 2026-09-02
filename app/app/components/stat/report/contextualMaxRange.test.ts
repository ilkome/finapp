import { describe, expect, it } from 'vitest'

import { shouldUseContextualMaxRange } from './contextualMaxRange'

describe('shouldUseContextualMaxRange', () => {
  it('narrows the maximum range for a category without requiring a transaction type', () => {
    expect(shouldUseContextualMaxRange({
      hasCategoryFilter: true,
      hasWalletFilter: false,
      isShowMaxRange: true,
    })).toBe(true)
  })

  it('narrows the maximum range for a wallet without requiring a category', () => {
    expect(shouldUseContextualMaxRange({
      hasCategoryFilter: false,
      hasWalletFilter: true,
      isShowMaxRange: true,
    })).toBe(true)
  })

  it('restores the original maximum range when temporary filters are cleared', () => {
    expect(shouldUseContextualMaxRange({ hasCategoryFilter: false, hasWalletFilter: false, isShowMaxRange: true })).toBe(false)
    expect(shouldUseContextualMaxRange({ hasCategoryFilter: true, hasWalletFilter: true, isShowMaxRange: false })).toBe(false)
  })
})
