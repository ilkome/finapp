import { describe, expect, it } from 'vitest'

import type { RecurrenceItem } from '~/components/recurrences/types'

import { TrnType } from '~/components/trns/types'

import { dueOccurrences, effectiveAmountFor, nextOccurrence, occurrencesInRange, occurrenceTrnId } from './occurrences'

const U = (y: number, m: number, d: number) => Date.UTC(y, m, d)

function rule(overrides: Partial<RecurrenceItem>): RecurrenceItem {
  return {
    amount: 100,
    anchorDate: U(2024, 0, 1),
    autoCreate: true,
    categoryId: 'cat',
    endMode: 'never',
    freq: 'month',
    interval: 1,
    monthLastDay: false,
    skipDates: [],
    status: 'active',
    type: TrnType.Expense,
    updatedAt: 0,
    walletId: 'w',
    ...overrides,
  }
}

describe('occurrencesInRange', () => {
  it('steps every N days', () => {
    const r = rule({ anchorDate: U(2024, 0, 1), freq: 'day', interval: 3 })
    expect(occurrencesInRange(r, { end: U(2024, 0, 10), start: U(2024, 0, 1) }))
      .toEqual([U(2024, 0, 1), U(2024, 0, 4), U(2024, 0, 7), U(2024, 0, 10)])
  })

  it('steps every N weeks (biweekly)', () => {
    const r = rule({ anchorDate: U(2024, 0, 1), freq: 'week', interval: 2 })
    expect(occurrencesInRange(r, { end: U(2024, 1, 1), start: U(2024, 0, 1) }))
      .toEqual([U(2024, 0, 1), U(2024, 0, 15), U(2024, 0, 29)])
  })

  it('keeps day-of-month and clamps 31 to month length', () => {
    const r = rule({ anchorDate: U(2024, 0, 31), freq: 'month', interval: 1 })
    // Jan31, Feb29 (leap clamp), Mar31, Apr30
    expect(occurrencesInRange(r, { end: U(2024, 3, 30), start: U(2024, 0, 1) }))
      .toEqual([U(2024, 0, 31), U(2024, 1, 29), U(2024, 2, 31), U(2024, 3, 30)])
  })

  it('monthLastDay always fires on the last calendar day', () => {
    const r = rule({ anchorDate: U(2024, 0, 15), freq: 'month', interval: 1, monthLastDay: true })
    expect(occurrencesInRange(r, { end: U(2024, 2, 31), start: U(2024, 0, 1) }))
      .toEqual([U(2024, 0, 31), U(2024, 1, 29), U(2024, 2, 31)])
  })

  it('yearly clamps Feb 29 -> Feb 28 in non-leap years', () => {
    const r = rule({ anchorDate: U(2024, 1, 29), freq: 'year', interval: 1 })
    expect(occurrencesInRange(r, { end: U(2026, 5, 1), start: U(2024, 0, 1) }))
      .toEqual([U(2024, 1, 29), U(2025, 1, 28), U(2026, 1, 28)])
  })

  it('stops at endDate (date mode)', () => {
    const r = rule({ anchorDate: U(2024, 0, 1), endDate: U(2024, 2, 1), endMode: 'date', freq: 'month' })
    expect(occurrencesInRange(r, { end: U(2024, 11, 1), start: U(2024, 0, 1) }))
      .toEqual([U(2024, 0, 1), U(2024, 1, 1), U(2024, 2, 1)])
  })

  it('stops after endCount occurrences (count mode)', () => {
    const r = rule({ anchorDate: U(2024, 0, 1), endCount: 3, endMode: 'count', freq: 'month' })
    expect(occurrencesInRange(r, { end: U(2024, 11, 1), start: U(2024, 0, 1) }))
      .toEqual([U(2024, 0, 1), U(2024, 1, 1), U(2024, 2, 1)])
  })

  it('excludes skipped days', () => {
    const r = rule({ anchorDate: U(2024, 0, 1), freq: 'month', skipDates: ['2024-02-01'] })
    expect(occurrencesInRange(r, { end: U(2024, 2, 1), start: U(2024, 0, 1) }))
      .toEqual([U(2024, 0, 1), U(2024, 2, 1)])
  })

  it('returns nothing for a cancelled rule', () => {
    const r = rule({ status: 'cancelled' })
    expect(occurrencesInRange(r, { end: U(2024, 11, 1), start: U(2024, 0, 1) })).toEqual([])
  })

  it('fast-forwards to a far future range without scanning all history', () => {
    const r = rule({ anchorDate: U(2000, 0, 1), freq: 'day', interval: 1 })
    const out = occurrencesInRange(r, { end: U(2024, 0, 3), start: U(2024, 0, 1) })
    expect(out).toEqual([U(2024, 0, 1), U(2024, 0, 2), U(2024, 0, 3)])
  })
})

describe('nextOccurrence', () => {
  it('returns the first occurrence strictly after now', () => {
    const r = rule({ anchorDate: U(2024, 0, 1), freq: 'month' })
    expect(nextOccurrence(r, U(2024, 0, 1))).toBe(U(2024, 1, 1))
    expect(nextOccurrence(r, U(2024, 0, 15))).toBe(U(2024, 1, 1))
  })

  it('respects end and skip', () => {
    const r = rule({ anchorDate: U(2024, 0, 1), endCount: 2, endMode: 'count', freq: 'month' })
    expect(nextOccurrence(r, U(2024, 1, 1))).toBeUndefined()
  })
})

describe('occurrenceTrnId', () => {
  it('is deterministic from ruleId + civil day', () => {
    expect(occurrenceTrnId('abc', U(2024, 2, 5))).toBe('abc:2024-03-05')
  })
})

describe('dueOccurrences (catch-up)', () => {
  it('materializes every missed occurrence after lastGeneratedDate through today', () => {
    const r = rule({ anchorDate: U(2024, 0, 1), freq: 'month', lastGeneratedDate: U(2024, 0, 1) })
    expect(dueOccurrences(r, U(2024, 3, 1))).toEqual([U(2024, 1, 1), U(2024, 2, 1), U(2024, 3, 1)])
  })

  it('starts at the anchor on first run', () => {
    const r = rule({ anchorDate: U(2024, 0, 1), freq: 'month', lastGeneratedDate: null })
    expect(dueOccurrences(r, U(2024, 1, 1))).toEqual([U(2024, 0, 1), U(2024, 1, 1)])
  })

  it('is empty when nothing is due', () => {
    const r = rule({ anchorDate: U(2024, 0, 1), freq: 'month', lastGeneratedDate: U(2024, 3, 1) })
    expect(dueOccurrences(r, U(2024, 3, 1))).toEqual([])
  })

  it('generates nothing before a future start, then the anchor once due', () => {
    const r = rule({ anchorDate: U(2024, 5, 1), freq: 'month', lastGeneratedDate: null })
    expect(dueOccurrences(r, U(2024, 4, 15))).toEqual([])
    expect(dueOccurrences(r, U(2024, 5, 1))).toEqual([U(2024, 5, 1)])
  })
})

describe('effectiveAmountFor', () => {
  it('returns the scalar amount when there is no history', () => {
    const r = rule({ amount: 100 })
    expect(effectiveAmountFor(r, U(2024, 5, 1))).toBe(100)
  })

  it('picks the price effective on the day, holding until the next change', () => {
    const r = rule({
      amount: 600,
      amountHistory: [
        { amount: 500, from: U(2024, 0, 1) },
        { amount: 600, from: U(2024, 6, 1) },
      ],
    })
    expect(effectiveAmountFor(r, U(2024, 5, 30))).toBe(500)
    expect(effectiveAmountFor(r, U(2024, 6, 1))).toBe(600)
    expect(effectiveAmountFor(r, U(2024, 8, 1))).toBe(600)
  })

  it('falls back to the earliest price for days before the first entry', () => {
    const r = rule({
      amount: 600,
      amountHistory: [{ amount: 500, from: U(2024, 6, 1) }],
    })
    expect(effectiveAmountFor(r, U(2024, 0, 1))).toBe(500)
  })
})
