import { describe, expect, it } from 'vitest'

import { creditUtilization } from '~/components/wallets/analytics/debts'

describe('creditUtilization', () => {
  it('measures each card with a limit and flags a high one', () => {
    const result = creditUtilization([{ debt: 50, id: 'a', limit: 100 }, { debt: 10, id: 'b', limit: 100 }, { debt: 999, id: 'c' }])
    expect(result.items.map(item => [item.id, item.share, item.isWarning])).toEqual([['a', 0.5, true], ['b', 0.1, false]])
    expect(result.total).toEqual({ debt: 60, isWarning: false, limit: 200, share: 0.3 })
  })
})
