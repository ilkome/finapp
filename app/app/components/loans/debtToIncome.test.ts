import { describe, expect, it } from 'vitest'
import { toCivilDayEpoch } from '~~/utils/date/civil'

import { debtToIncome, incomeWindow } from './debtToIncome'

describe('incomeWindow', () => {
  it('takes the three full months before the current one', () => {
    expect(incomeWindow(toCivilDayEpoch(2026, 9, 8))).toEqual({
      end: toCivilDayEpoch(2026, 8, 30),
      start: toCivilDayEpoch(2026, 6, 1),
    })
  })

  it('crosses the year boundary', () => {
    expect(incomeWindow(toCivilDayEpoch(2026, 0, 15)).start).toBe(toCivilDayEpoch(2025, 9, 1))
  })
})

describe('debtToIncome', () => {
  it('compares the payments with the average monthly income', () => {
    expect(debtToIncome(30_000, 300_000)).toEqual({ payments: 30_000, share: 0.3 })
  })

  it('is null without income or without payments', () => {
    expect(debtToIncome(30_000, 0)).toBeNull()
    expect(debtToIncome(0, 300_000)).toBeNull()
  })
})
