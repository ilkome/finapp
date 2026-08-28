import { describe, expect, it } from 'vitest'

import { resolveSplitChartSelection } from '~/components/stat/chart/splitChartSelection'

describe('resolveSplitChartSelection', () => {
  it('selects the clicked chart type and remembers the current mode', () => {
    expect(resolveSplitChartSelection('net', 'income', 100, {})).toEqual({
      nextType: 'income',
      state: { activeIntervalKey: 100, activeType: 'income', previousType: 'net' },
    })
  })

  it('keeps the selected type when another period is clicked', () => {
    expect(resolveSplitChartSelection('income', 'income', 200, {
      activeIntervalKey: 100,
      activeType: 'income',
      previousType: 'net',
    })).toEqual({
      nextType: 'income',
      state: { activeIntervalKey: 200, activeType: 'income', previousType: 'net' },
    })
  })

  it('restores the previous mode when the selected period is clicked again', () => {
    expect(resolveSplitChartSelection('income', 'income', 100, {
      activeIntervalKey: 100,
      activeType: 'income',
      previousType: 'expense',
    })).toEqual({
      nextType: 'expense',
      state: {},
    })
  })

  it('starts a new selection when the selected mode changed elsewhere', () => {
    expect(resolveSplitChartSelection('expense', 'income', 100, {
      activeIntervalKey: 100,
      activeType: 'income',
      previousType: 'net',
    })).toEqual({
      nextType: 'income',
      state: { activeIntervalKey: 100, activeType: 'income', previousType: 'expense' },
    })
  })
})
