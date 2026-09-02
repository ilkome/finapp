import { describe, expect, it } from 'vitest'

import { shouldUseContextualMaxRange } from './contextualMaxRange'

describe('shouldUseContextualMaxRange', () => {
  it('narrows the maximum range for an explicit type and quick category', () => {
    expect(shouldUseContextualMaxRange({
      categoryIds: ['mehana'],
      isShowMaxRange: true,
      selectedType: 'income',
    })).toBe(true)
  })

  it('restores the original maximum range when either temporary filter is cleared', () => {
    expect(shouldUseContextualMaxRange({ categoryIds: [], isShowMaxRange: true, selectedType: 'income' })).toBe(false)
    expect(shouldUseContextualMaxRange({ categoryIds: ['mehana'], isShowMaxRange: true, selectedType: 'net' })).toBe(false)
    expect(shouldUseContextualMaxRange({ categoryIds: ['mehana'], isShowMaxRange: false, selectedType: 'income' })).toBe(false)
  })
})
