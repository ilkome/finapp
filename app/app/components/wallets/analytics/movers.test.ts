import { describe, expect, it } from 'vitest'

import { topMovers } from '~/components/wallets/analytics/movers'

describe('topMovers', () => {
  it('ranks categories by the size of the change, new ones without a percent', () => {
    const result = topMovers(new Map([['food', 300], ['rent', 1000], ['taxi', 50]]), new Map([['food', 200], ['rent', 1000], ['gym', 120]]), 2)
    expect(result).toEqual([
      { current: 0, delta: -120, id: 'gym', previous: 120, share: -1 },
      { current: 300, delta: 100, id: 'food', previous: 200, share: 0.5 },
    ])
    expect(topMovers(new Map([['taxi', 50]]), new Map())[0]!.share).toBeUndefined()
  })
})
