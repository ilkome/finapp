import { describe, expect, it } from 'vitest'

import { buildStatSummaryItems } from '~/components/stat/sum/summaryItems'

describe('buildStatSummaryItems', () => {
  it('hides income when the period only contains expenses', () => {
    expect(buildStatSummaryItems({ expense: 40, income: 0, net: -40 }, 'net')).toEqual([
      { amount: -40, isActive: false, type: 'expense' },
    ])
  })

  it('hides expense when the period only contains income', () => {
    expect(buildStatSummaryItems({ expense: 0, income: 100, net: 100 }, 'income')).toEqual([
      { amount: 100, isActive: true, type: 'income' },
    ])
  })

  it('hides total when income and expense cancel out', () => {
    expect(buildStatSummaryItems({ expense: 100, income: 100, net: 0 }, 'net')).toEqual([
      { amount: -100, isActive: false, type: 'expense' },
      { amount: 100, isActive: false, type: 'income' },
    ])
  })
})
