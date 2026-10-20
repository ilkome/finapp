import { describe, expect, it } from 'vitest'

import { buildInsights } from '~/components/wallets/analytics/insights'

describe('buildInsights', () => {
  it('notes a fast month, a heavy interest share and a savings-rate swing, largest first', () => {
    expect(buildInsights({ expenseEstimate: 123, expenseMedian: 100, expenseTotal: 1000, interestTotal: 120, savingsRateNow: 0.1, savingsRatePrevious: 0.4 })).toEqual([
      { from: 40, id: 'savingsRate', to: 10 },
      { id: 'expensePace', percent: 23 },
      { id: 'interestShare', percent: 12 },
    ])
  })

  it('stays quiet on small gaps', () => {
    expect(buildInsights({ expenseEstimate: 105, expenseMedian: 100, expenseTotal: 1000, interestTotal: 10 })).toEqual([])
  })
})
