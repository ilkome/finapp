import { describe, expect, it } from 'vitest'

import { intervalStats, isLastIntervalPartial, paceOf } from '~/components/wallets/analytics/stats'

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
