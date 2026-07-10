import { describe, expect, it } from 'vitest'

import type { RecurrenceItem } from '~/components/recurrences/types'

import { TrnType } from '~/components/trns/types'

import type { OccurrenceMatchTrn } from './occurrences'

import { committedNativeInRange, dueOccurrences, effectiveAmountFor, nextOccurrence, occurrencesInRange, occurrenceStatus, occurrenceTrnId, unrealizedOccurrenceDays } from './occurrences'

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

describe('occurrenceStatus', () => {
  const today = U(2024, 5, 15)
  const trnsFor = (day: number, amount?: number) => ({ [occurrenceTrnId('r', day)]: amount === undefined ? {} : { amount } })

  it('is paid when a matching trn sits at the effective price', () => {
    const r = rule({ amount: 100 })
    const day = U(2024, 5, 10)
    const s = occurrenceStatus(r, 'r', day, trnsFor(day, 100), today)
    expect(s).toMatchObject({ actual: 100, expected: 100, state: 'paid' })
  })

  it('is drift when the trn amount differs from the scalar price', () => {
    const r = rule({ amount: 100 })
    const day = U(2024, 5, 10)
    expect(occurrenceStatus(r, 'r', day, trnsFor(day, 120), today).state).toBe('drift')
  })

  it('compares against the amount-history-effective price, not the scalar', () => {
    // On 10 Jun the effective price is 500 (history), while the scalar is 600.
    const r = rule({ amount: 600, amountHistory: [{ amount: 500, from: U(2024, 0, 1) }, { amount: 600, from: U(2024, 6, 1) }] })
    const day = U(2024, 5, 10)
    expect(occurrenceStatus(r, 'r', day, trnsFor(day, 500), today).state).toBe('paid')
    expect(occurrenceStatus(r, 'r', day, trnsFor(day, 600), today).state).toBe('drift')
  })

  it('is overdue for a past unmaterialized day and upcoming for a future one', () => {
    const r = rule({ amount: 100 })
    expect(occurrenceStatus(r, 'r', U(2024, 5, 10), {}, today).state).toBe('overdue')
    expect(occurrenceStatus(r, 'r', U(2024, 5, 20), {}, today).state).toBe('upcoming')
  })

  it('treats an occurrence landing exactly today as overdue', () => {
    const r = rule({ amount: 100 })
    expect(occurrenceStatus(r, 'r', today, {}, today).state).toBe('overdue')
  })

  it('falls through to overdue when the matched trn carries no amount', () => {
    const r = rule({ amount: 100 })
    const day = U(2024, 5, 10)
    expect(occurrenceStatus(r, 'r', day, trnsFor(day), today).state).toBe('overdue')
  })
})

describe('committedNativeInRange', () => {
  it('sums the flat scalar when there is no price history', () => {
    const r = rule({ amount: 100, freq: 'month' })
    // Jan..Apr 2024 = 4 monthly occurrences
    expect(committedNativeInRange(r, { end: U(2024, 3, 1), start: U(2024, 0, 1) })).toBe(400)
  })

  it('prices each occurrence at its effective amount across a mid-window change', () => {
    const r = rule({ amount: 200, amountHistory: [{ amount: 100, from: U(2024, 0, 1) }, { amount: 200, from: U(2024, 2, 1) }], freq: 'month' })
    // Jan,Feb @100 + Mar,Apr @200 = 600, vs a flat amount*count of 800
    expect(committedNativeInRange(r, { end: U(2024, 3, 1), start: U(2024, 0, 1) })).toBe(600)
  })

  it('is zero when no occurrence falls in the range', () => {
    const r = rule({ amount: 100, anchorDate: U(2024, 0, 1), freq: 'month' })
    expect(committedNativeInRange(r, { end: U(2023, 11, 1), start: U(2023, 6, 1) })).toBe(0)
  })
})

describe('unrealizedOccurrenceDays', () => {
  // Default rule() is monthly anchored Jan 1 2024, so June holds exactly one occurrence (Jun 1).
  const june = { end: U(2024, 5, 30), start: U(2024, 5, 1) }
  const cand = (over: Partial<OccurrenceMatchTrn>): OccurrenceMatchTrn => ({
    amount: 100,
    date: U(2024, 5, 5),
    id: 't',
    recurrenceId: undefined,
    type: TrnType.Expense,
    ...over,
  })

  it('excludes an occurrence already materialized by its deterministic trn', () => {
    const r = rule({ freq: 'month' })
    const trns = { [occurrenceTrnId('r', U(2024, 5, 1))]: { amount: 100 } }
    expect(unrealizedOccurrenceDays(r, 'r', june, trns, [], new Set())).toEqual([])
  })

  it('excludes an unlinked look-alike (same type + exact expected amount) and consumes it', () => {
    const r = rule({ freq: 'month' })
    const consumed = new Set<string>()
    const out = unrealizedOccurrenceDays(r, 'r', june, {}, [cand({ id: 't1' })], consumed)
    expect(out).toEqual([])
    expect(consumed.has('t1')).toBe(true)
  })

  it('keeps the day when the candidate amount differs from the expected price', () => {
    const r = rule({ freq: 'month' })
    expect(unrealizedOccurrenceDays(r, 'r', june, {}, [cand({ amount: 120 })], new Set()))
      .toEqual([U(2024, 5, 1)])
  })

  it('excludes a linked trn (recurrenceId === ruleId, same day) regardless of amount', () => {
    const r = rule({ freq: 'month' })
    const linked = cand({ amount: 999, date: U(2024, 5, 1), id: 't2', recurrenceId: 'r' })
    expect(unrealizedOccurrenceDays(r, 'r', june, {}, [linked], new Set())).toEqual([])
  })

  it('consumes each candidate at most once (two occurrences, one look-alike)', () => {
    const r = rule({ freq: 'month' })
    const range = { end: U(2024, 6, 30), start: U(2024, 5, 1) } // Jun 1 + Jul 1
    const out = unrealizedOccurrenceDays(r, 'r', range, {}, [cand({ id: 't3' })], new Set())
    expect(out).toEqual([U(2024, 6, 1)])
  })

  it('does not match a look-alike of the wrong type', () => {
    const r = rule({ freq: 'month' }) // Expense rule
    expect(unrealizedOccurrenceDays(r, 'r', june, {}, [cand({ type: TrnType.Income })], new Set()))
      .toEqual([U(2024, 5, 1)])
  })

  it('matches against the amount-history effective price, not the scalar', () => {
    // On Jun 1 the effective price is 500 (600 starts Jul 1); the scalar is 600.
    const r = rule({ amount: 600, amountHistory: [{ amount: 500, from: U(2024, 0, 1) }, { amount: 600, from: U(2024, 6, 1) }], freq: 'month' })
    expect(unrealizedOccurrenceDays(r, 'r', june, {}, [cand({ amount: 500 })], new Set())).toEqual([])
    expect(unrealizedOccurrenceDays(r, 'r', june, {}, [cand({ amount: 600 })], new Set())).toEqual([U(2024, 5, 1)])
  })
})
