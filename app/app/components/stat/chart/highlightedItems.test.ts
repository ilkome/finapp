import { describe, expect, it } from 'vitest'

import { partitionHighlightedItems } from './highlightedItems'

describe('partitionHighlightedItems', () => {
  it('keeps the largest items and returns the rest separately', () => {
    const result = partitionHighlightedItems({
      getMagnitude: item => item.value,
      items: [
        { id: 'small', value: 10 },
        { id: 'large', value: -100 },
        { id: 'medium', value: 50 },
      ],
      limit: 2,
    })

    expect(result.highlighted.map(item => item.id)).toEqual(['large', 'medium'])
    expect(result.remainder.map(item => item.id)).toEqual(['small'])
  })

  it('keeps an existing remainder outside the ranked items', () => {
    const result = partitionHighlightedItems({
      getMagnitude: item => item.value,
      isRemainder: item => item.id === 'other',
      items: [
        { id: 'other', value: 1000 },
        { id: 'category', value: 10 },
      ],
    })

    expect(result.highlighted.map(item => item.id)).toEqual(['category'])
    expect(result.remainder.map(item => item.id)).toEqual(['other'])
  })
})
