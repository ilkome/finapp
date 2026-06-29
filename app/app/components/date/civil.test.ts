import { describe, expect, it } from 'vitest'

import {
  addCivilDays,
  addCivilMonths,
  addCivilYears,
  civilDayKey,
  civilDayStart,
  epochToCivilParts,
  getEndOf,
  getStartOf,
  isSameCivilDay,
  lastDayOfMonthCivil,
  toCivilDayEpoch,
} from '~/components/date/utils'

const DAY = 86_400_000

describe('civil-day helpers', () => {
  it('toCivilDayEpoch / epochToCivilParts round-trip in UTC', () => {
    const ms = toCivilDayEpoch(2024, 2, 15) // 2024-03-15
    expect(ms).toBe(Date.UTC(2024, 2, 15))
    expect(epochToCivilParts(ms)).toEqual({ day: 15, month: 2, year: 2024 })
  })

  it('civilDayStart snaps any instant to its UTC calendar day', () => {
    expect(civilDayStart(Date.UTC(2024, 2, 15, 23, 59))).toBe(Date.UTC(2024, 2, 15))
    expect(civilDayStart(Date.UTC(2024, 2, 15, 0, 0, 0, 1))).toBe(Date.UTC(2024, 2, 15))
  })

  it('civilDayKey formats YYYY-MM-DD in UTC', () => {
    expect(civilDayKey(Date.UTC(2024, 0, 5))).toBe('2024-01-05')
    expect(civilDayKey(Date.UTC(2024, 11, 31))).toBe('2024-12-31')
  })

  it('addCivilDays / isSameCivilDay are DST-free', () => {
    expect(addCivilDays(Date.UTC(2024, 2, 15), 1)).toBe(Date.UTC(2024, 2, 16))
    expect(addCivilDays(Date.UTC(2024, 2, 15), -1)).toBe(Date.UTC(2024, 2, 14))
    expect(isSameCivilDay(Date.UTC(2024, 2, 15), Date.UTC(2024, 2, 15, 18))).toBe(true)
    expect(isSameCivilDay(Date.UTC(2024, 2, 15), Date.UTC(2024, 2, 16))).toBe(false)
  })

  it('addCivilMonths clamps the day to the target month length', () => {
    // Jan 31 + 1 month -> Feb 29 (leap year)
    expect(addCivilMonths(Date.UTC(2024, 0, 31), 1)).toBe(Date.UTC(2024, 1, 29))
    // Mar 31 - 1 month -> Feb 29
    expect(addCivilMonths(Date.UTC(2024, 2, 31), -1)).toBe(Date.UTC(2024, 1, 29))
    // Jan 31 + 1 month in a non-leap year -> Feb 28
    expect(addCivilMonths(Date.UTC(2023, 0, 31), 1)).toBe(Date.UTC(2023, 1, 28))
  })

  it('addCivilYears clamps Feb 29 -> Feb 28', () => {
    expect(addCivilYears(Date.UTC(2024, 1, 29), 1)).toBe(Date.UTC(2025, 1, 28))
  })

  it('lastDayOfMonthCivil', () => {
    expect(lastDayOfMonthCivil(Date.UTC(2024, 1, 10))).toBe(Date.UTC(2024, 1, 29))
    expect(lastDayOfMonthCivil(Date.UTC(2023, 1, 10))).toBe(Date.UTC(2023, 1, 28))
  })

  it('getStartOf / getEndOf compute UTC boundaries (Monday-based weeks)', () => {
    const d = new Date(Date.UTC(2024, 10, 15)) // Fri 2024-11-15
    expect(getStartOf(d, 'day').getTime()).toBe(Date.UTC(2024, 10, 15))
    expect(getEndOf(d, 'day').getTime()).toBe(Date.UTC(2024, 10, 16) - 1)
    expect(getStartOf(d, 'week').getTime()).toBe(Date.UTC(2024, 10, 11)) // Monday
    expect(getEndOf(d, 'week').getTime()).toBe(Date.UTC(2024, 10, 18) - 1) // Sunday end
    expect(getStartOf(d, 'month').getTime()).toBe(Date.UTC(2024, 10, 1))
    expect(getEndOf(d, 'month').getTime()).toBe(Date.UTC(2024, 11, 1) - 1)
    expect(getStartOf(d, 'year').getTime()).toBe(Date.UTC(2024, 0, 1))
    expect(getEndOf(d, 'year').getTime()).toBe(Date.UTC(2025, 0, 1) - 1)
  })

  it('end-of-day is one ms before next midnight', () => {
    expect(getEndOf(new Date(Date.UTC(2024, 2, 15)), 'day').getTime()).toBe(Date.UTC(2024, 2, 15) + DAY - 1)
  })
})
