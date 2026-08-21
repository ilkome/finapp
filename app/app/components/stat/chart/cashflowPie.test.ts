import { describe, expect, it } from 'vitest'

import { buildCashflowPieData, hideSingleColorPie } from '~/components/stat/chart/cashflowPie'

describe('buildCashflowPieData', () => {
  it('uses expense and income magnitudes with their standard colors', () => {
    expect(buildCashflowPieData({ expense: 40, income: 100 })).toEqual([
      { color: 'var(--color-expense-1)', value: 40 },
      { color: 'var(--color-income-1)', value: 100 },
    ])
  })

  it('omits empty sides', () => {
    expect(buildCashflowPieData({ expense: 0, income: 100 })).toEqual([
      { color: 'var(--color-income-1)', value: 100 },
    ])
  })
})

describe('hideSingleColorPie', () => {
  it('hides a pie whose segments all have the same color', () => {
    expect(hideSingleColorPie([
      { color: 'red', value: 40 },
      { color: 'red', value: 60 },
    ])).toEqual([])
  })

  it('keeps a pie with visually distinct segments', () => {
    const data = [
      { color: 'red', value: 40 },
      { color: 'green', value: 60 },
    ]

    expect(hideSingleColorPie(data)).toEqual(data)
  })
})
