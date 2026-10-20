import { describe, expect, it } from 'vitest'

import { expenseAnomalies, incomeStability, intervalStats, isLastIntervalPartial, nextMilestone, paceOf, rollingMean, savingsRateTrend } from '~/components/wallets/analytics/stats'

const day = (iso: string) => Date.parse(`${iso}T00:00:00Z`)

describe('isLastIntervalPartial', () => {
  it('is partial while the interval runs past today', () => {
    expect(isLastIntervalPartial([{ end: day('2026-10-20') + 86_399_999, start: day('2026-10-01') }], 'month')).toBe(true)
    expect(isLastIntervalPartial([{ end: day('2026-10-31') + 86_399_999, start: day('2026-10-01') }], 'month')).toBe(false)
  })
})

describe('intervalStats', () => {
  it('leaves the current interval out', () => {
    expect(intervalStats([100, -50, 300, 9999], 3)).toEqual({ average: 117, bestIndex: 2, median: 100, worstIndex: 1 })
    expect(intervalStats([5], 0)).toBeNull()
  })
})

describe('paceOf', () => {
  it('does not read rent on the 1st as an anomaly', () => {
    // Every month: rent 1000 on the 1st, then 500 spread over the rest.
    const past = [{ byNow: 1100, total: 1500 }, { byNow: 1100, total: 1500 }, { byNow: 1100, total: 1500 }]
    expect(paceOf({ actual: 1100, elapsedShare: 0.2, past })).toEqual({ estimate: 1500, expectedByNow: 1100 })
  })

  it('reads a steady month the same way', () => {
    const past = [{ byNow: 500, total: 1000 }, { byNow: 520, total: 1000 }, { byNow: 480, total: 1000 }]
    expect(paceOf({ actual: 500, elapsedShare: 0.5, past })).toEqual({ estimate: 1000, expectedByNow: 500 })
  })

  it('scales by days with too little history', () => {
    expect(paceOf({ actual: 300, elapsedShare: 0.25, past: [{ byNow: 1, total: 2 }] })).toEqual({ estimate: 1200 })
  })
})

describe('savingsRateTrend', () => {
  it('leaves intervals without income empty and clamps a tiny income', () => {
    const { rates, rolling } = savingsRateTrend([100, 0, 1, 200], [50, -30, -500, 100])
    expect(rates).toEqual([0.5, null, -1, 0.5])
    expect(rolling[1]).toBe(0.5)
  })

  it('averages over the window', () => {
    expect(rollingMean([1, 2, 3, 4], 2)).toEqual([1, 1.5, 2.5, 3.5])
  })
})

describe('expenseAnomalies', () => {
  it('flags full intervals well above the median, not the current one', () => {
    expect(expenseAnomalies([100, 100, 400, 100, 900], 4)).toEqual([2])
  })
})

describe('incomeStability', () => {
  it('reads the share of intervals with income and its spread', () => {
    expect(incomeStability([1000, 0, 1200, 1100, 5], 4)).toEqual({ max: 1200, median: 1050, min: 0, share: 0.75 })
  })
})

describe('nextMilestone', () => {
  it('finds the next round number and the date at the pace', () => {
    const today = Date.UTC(2026, 0, 1)
    const result = nextMilestone(1_230_000, 90_000, today)
    expect(result.target).toBe(1_500_000)
    expect(result.date).toBeGreaterThan(Date.UTC(2026, 2, 1))
    expect(nextMilestone(1_230_000, -5, today).date).toBeNull()
  })
})
