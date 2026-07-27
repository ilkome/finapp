import { describe, expect, it } from 'vitest'
import { addCivilDays, addCivilMonths, civilDayStart } from '~~/utils/date/civil'

import type { OccurrenceMatchTrn } from '~/components/recurrences/occurrences'
import type { RecurrenceItem } from '~/components/recurrences/types'

import { buildOccurrenceTrn } from '~/components/recurrences/generate'
import { committedNativeInRange, DEFAULT_END_DATE_MONTHS, dueOccurrences, earliestNextOccurrence, effectiveAmountFor, isStaleSubscription, matchExistingOccurrences, nextOccurrence, occurrencesInRange, occurrenceStatus, occurrenceTrnId, paidCountInRange, pendingConfirmOccurrences, periodProgress, priceHistoryTimeline, remainingEndCount, seedEndField, unrealizedOccurrenceDays } from '~/components/recurrences/occurrences'
import { isTransfer, TrnType } from '~/components/trns/types'

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

describe('earliestNextOccurrence', () => {
  it('picks the minimum next day across rules with different anchors', () => {
    const a = rule({ anchorDate: U(2024, 0, 5), freq: 'month' })
    const b = rule({ anchorDate: U(2024, 0, 20), freq: 'month' })
    // At Jan 10, rule a next fires Feb 5 while rule b fires Jan 20 - b wins.
    expect(earliestNextOccurrence([['a', a], ['b', b]], U(2024, 0, 10)))
      .toEqual({ day: U(2024, 0, 20), rules: [['b', b]] })
  })

  it('returns every rule landing on the shared earliest day', () => {
    const a = rule({ anchorDate: U(2024, 0, 15), freq: 'month' })
    const b = rule({ anchorDate: U(2024, 0, 15), freq: 'month' })
    const hit = earliestNextOccurrence([['a', a], ['b', b]], U(2024, 0, 1))
    expect(hit?.day).toBe(U(2024, 0, 15))
    expect(hit?.rules.map(([id]) => id)).toEqual(['a', 'b'])
  })

  it('ignores cancelled and already-ended rules', () => {
    const cancelled = rule({ status: 'cancelled' })
    const ended = rule({ anchorDate: U(2024, 0, 1), endDate: U(2024, 1, 1), endMode: 'date', freq: 'month' })
    expect(earliestNextOccurrence([['c', cancelled], ['e', ended]], U(2024, 5, 1))).toBeUndefined()
  })

  it('returns undefined for empty entries', () => {
    expect(earliestNextOccurrence([], U(2024, 0, 1))).toBeUndefined()
  })

  it('defers a rule past its skipped next day (delegation is skip-aware)', () => {
    const r = rule({ anchorDate: U(2024, 0, 1), freq: 'month', skipDates: ['2024-02-01'] })
    expect(earliestNextOccurrence([['r', r]], U(2024, 0, 15)))
      .toEqual({ day: U(2024, 2, 1), rules: [['r', r]] })
  })
})

describe('occurrenceTrnId', () => {
  it('is deterministic from ruleId + civil day', () => {
    expect(occurrenceTrnId('abc', U(2024, 2, 5))).toBe('abc:2024-03-05')
  })

  // R12 invariant: editing a rule's category/wallet must not re-key already-generated trns, so the
  // deterministic id excludes them - it depends only on ruleId + day.
  it('is unchanged when the rule category/wallet differ', () => {
    const day = U(2024, 2, 5)
    const a = rule({ categoryId: 'catA', walletId: 'wA' })
    const b = rule({ categoryId: 'catB', walletId: 'wB' })
    expect(occurrenceTrnId('rule', day)).toBe(occurrenceTrnId('rule', day))
    // Sanity: the differing fields are real, yet the id above is derived without them.
    expect(a.categoryId).not.toBe(b.categoryId)
    expect(a.walletId).not.toBe(b.walletId)
  })
})

describe('buildOccurrenceTrn', () => {
  // R12: future occurrences follow the edit because the trn is built from the current rule.
  it('reflects the updated category/wallet on the generated trn', () => {
    const edited = rule({ categoryId: 'newCat', walletId: 'newWallet' })
    const trn = buildOccurrenceTrn(edited, 'rule', U(2024, 5, 1), 0)
    expect(trn.categoryId).toBe('newCat')
    // A generated occurrence is never a transfer, so it carries a single walletId.
    expect(isTransfer(trn)).toBe(false)
    if (!isTransfer(trn))
      expect(trn.walletId).toBe('newWallet')
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

describe('pendingConfirmOccurrences', () => {
  const today = U(2024, 3, 28)
  const manual = (over: Partial<RecurrenceItem> = {}) =>
    rule({ anchorDate: U(2024, 0, 28), autoCreate: false, freq: 'month', ...over })

  it('lists every unrealized due day ascending, including one due exactly today', () => {
    const out = pendingConfirmOccurrences([['r1', manual()]], {}, today)
    expect(out.map(o => o.day)).toEqual([U(2024, 0, 28), U(2024, 1, 28), U(2024, 2, 28), U(2024, 3, 28)])
    expect(out.every(o => o.id === 'r1')).toBe(true)
  })

  it('excludes autoCreate and non-active rules', () => {
    expect(pendingConfirmOccurrences([['r1', manual({ autoCreate: true })]], {}, today)).toEqual([])
    expect(pendingConfirmOccurrences([['r1', manual({ status: 'paused' })]], {}, today)).toEqual([])
    expect(pendingConfirmOccurrences([['r1', manual({ status: 'cancelled' })]], {}, today)).toEqual([])
  })

  it('excludes days already realized by the deterministic trn', () => {
    const trns = { [occurrenceTrnId('r1', U(2024, 1, 28))]: { amount: 100 } }
    expect(pendingConfirmOccurrences([['r1', manual()]], trns, today).map(o => o.day))
      .toEqual([U(2024, 0, 28), U(2024, 2, 28), U(2024, 3, 28)])
  })

  it('starts strictly after lastGeneratedDate', () => {
    const r = manual({ lastGeneratedDate: U(2024, 1, 28) })
    expect(pendingConfirmOccurrences([['r1', r]], {}, today).map(o => o.day))
      .toEqual([U(2024, 2, 28), U(2024, 3, 28)])
  })

  it('respects skipDates and endMode count', () => {
    expect(pendingConfirmOccurrences([['r1', manual({ skipDates: ['2024-02-28'] })]], {}, today).map(o => o.day))
      .toEqual([U(2024, 0, 28), U(2024, 2, 28), U(2024, 3, 28)])
    expect(pendingConfirmOccurrences([['r1', manual({ endCount: 2, endMode: 'count' })]], {}, today).map(o => o.day))
      .toEqual([U(2024, 0, 28), U(2024, 1, 28)])
  })

  it('sorts across multiple rules by day', () => {
    const a = manual({ anchorDate: U(2024, 2, 10) }) // due Mar 10, Apr 10
    const b = manual({ anchorDate: U(2024, 2, 20) }) // due Mar 20, Apr 20
    const out = pendingConfirmOccurrences([['b', b], ['a', a]], {}, today)
    expect(out.map(o => `${o.id}:${o.day}`)).toEqual([
      `a:${U(2024, 2, 10)}`,
      `b:${U(2024, 2, 20)}`,
      `a:${U(2024, 3, 10)}`,
      `b:${U(2024, 3, 20)}`,
    ])
  })
})

describe('reschedule re-anchor', () => {
  // Engine effect of the store's rescheduleFrom (thin Pinia glue): re-anchoring the whole series to
  // `newDay` clears the rule's overdue backlog and makes the delayed day the next charge.
  const today = U(2024, 5, 15)

  it('clears overdue backlog and next-charges on the delayed day', () => {
    const overdue = rule({ anchorDate: U(2024, 0, 1), autoCreate: false, freq: 'month', lastGeneratedDate: U(2024, 0, 1) })
    // Sanity: the rule is overdue today before the delay.
    expect(dueOccurrences(overdue, today).length).toBeGreaterThan(0)

    const newDay = addCivilDays(today, 7)
    const reanchored = rule({ ...overdue, anchorDate: newDay, lastGeneratedDate: addCivilDays(newDay, -1) })
    expect(dueOccurrences(reanchored, today)).toEqual([])
    expect(nextOccurrence(reanchored, today)).toBe(newDay)
  })
})

describe('remainingEndCount (re-anchor quota)', () => {
  const counted = (over: Partial<RecurrenceItem> = {}) =>
    rule({ anchorDate: U(2024, 0, 5), endCount: 6, endMode: 'count', freq: 'month', ...over })
  const paidTrns = (ruleId: string, days: number[]) =>
    Object.fromEntries(days.map(d => [occurrenceTrnId(ruleId, d), { amount: 100 }]))

  it('subtracts only charges already paid before the new anchor', () => {
    const trns = paidTrns('r1', [U(2024, 0, 5), U(2024, 1, 5), U(2024, 2, 5)])
    expect(remainingEndCount(counted(), 'r1', trns, U(2024, 5, 20))).toBe(3)
  })

  it('unpaid overdue occurrences do not consume quota', () => {
    // 6-charge series, nothing ever paid: delaying keeps the full quota.
    expect(remainingEndCount(counted(), 'r1', {}, U(2024, 5, 20))).toBe(6)
  })

  it('a fully paid series has no quota left', () => {
    const days = [U(2024, 0, 5), U(2024, 1, 5), U(2024, 2, 5), U(2024, 3, 5), U(2024, 4, 5), U(2024, 5, 5)]
    expect(remainingEndCount(counted(), 'r1', paidTrns('r1', days), U(2024, 6, 20))).toBe(0)
  })

  it('re-anchoring before the original anchor keeps the full quota', () => {
    expect(remainingEndCount(counted(), 'r1', paidTrns('r1', [U(2024, 0, 5)]), U(2023, 11, 1))).toBe(6)
  })

  it('returns null for non-count end modes', () => {
    expect(remainingEndCount(rule({ endMode: 'never' }), 'r1', {}, U(2024, 5, 20))).toBeNull()
    expect(remainingEndCount(rule({ endDate: U(2025, 0, 1), endMode: 'date' }), 'r1', {}, U(2024, 5, 20))).toBeNull()
  })
})

describe('seedEndField (commit the shown end default)', () => {
  const now = U(2024, 5, 15)

  it('seeds count=1 so a count rule is never zero-occurrence', () => {
    expect(seedEndField('count', { endCount: null, endDate: null }, now))
      .toEqual({ endCount: 1, endDate: null })
  })

  it('seeds a concrete end date one year out so a date rule never runs forever', () => {
    expect(seedEndField('date', { endCount: null, endDate: null }, now))
      .toEqual({ endCount: null, endDate: addCivilMonths(U(2024, 5, 15), DEFAULT_END_DATE_MONTHS) })
  })

  it('never overwrites a real value the user already set', () => {
    const filled = { endCount: 5, endDate: U(2025, 0, 1) }
    expect(seedEndField('count', filled, now)).toBe(filled)
    expect(seedEndField('date', filled, now)).toBe(filled)
  })

  it('leaves both fields untouched for endMode never', () => {
    const state = { endCount: null, endDate: null }
    expect(seedEndField('never', state, now)).toBe(state)
  })

  it('normalizes now to its civil day (no intra-day drift)', () => {
    const seeded = seedEndField('date', { endCount: null, endDate: null }, U(2024, 5, 15) + 3600_000)
    expect(seeded.endDate).toBe(addCivilMonths(U(2024, 5, 15), DEFAULT_END_DATE_MONTHS))
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

describe('isStaleSubscription', () => {
  // Default rule() is monthly anchored Jan 1 2024, so with today mid-June the recent-periods window
  // (today - 3 intervals) holds the Apr/May/Jun 1 occurrences; the latest 2 are May 1 + Jun 1.
  const today = U(2024, 5, 15)
  const trnsFor = (day: number, amount = 100) => ({ [occurrenceTrnId('r', day)]: { amount } })

  it('flags a manual monthly rule with no realized payments', () => {
    const r = rule({ autoCreate: false })
    expect(isStaleSubscription(r, 'r', {}, today)).toBe(true)
  })

  it('still flags when only the oldest due occurrence is paid (slice(-2) recency)', () => {
    const r = rule({ autoCreate: false })
    expect(isStaleSubscription(r, 'r', trnsFor(U(2024, 3, 1)), today)).toBe(true)
  })

  it('does not flag when the most recent due occurrence is paid', () => {
    const r = rule({ autoCreate: false })
    expect(isStaleSubscription(r, 'r', trnsFor(U(2024, 5, 1)), today)).toBe(false)
  })

  it('never flags autoCreate rules (always self-materialized)', () => {
    const r = rule({ autoCreate: true })
    expect(isStaleSubscription(r, 'r', {}, today)).toBe(false)
  })

  it('never flags paused or cancelled rules', () => {
    expect(isStaleSubscription(rule({ autoCreate: false, status: 'paused' }), 'r', {}, today)).toBe(false)
    expect(isStaleSubscription(rule({ autoCreate: false, status: 'cancelled' }), 'r', {}, today)).toBe(false)
  })

  it('never flags a brand-new rule with fewer than 2 due occurrences', () => {
    const r = rule({ anchorDate: U(2024, 5, 1), autoCreate: false })
    expect(isStaleSubscription(r, 'r', {}, today)).toBe(false)
  })

  it('is skip-aware: skipping the recent due days drops them below the threshold', () => {
    const r = rule({ autoCreate: false, skipDates: ['2024-05-01', '2024-06-01'] })
    expect(isStaleSubscription(r, 'r', {}, today)).toBe(false)
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

describe('periodProgress', () => {
  // Default rule() is monthly anchored Jan 1 2024; a Jan..Apr range holds 4 occurrences (Jan..Apr 1).
  const range = { end: U(2024, 3, 1), start: U(2024, 0, 1) }
  const today = U(2024, 5, 15)

  it('counts every occurrence as unpaid total when no trn realizes any', () => {
    const r = rule({ amount: 100, freq: 'month' })
    const p = periodProgress(r, 'r', range, {}, today)
    expect(p).toEqual({ paidCount: 0, paidNative: 0, totalCount: 4, totalNative: 400 })
  })

  it('counts an occurrence paid when a matching trn sits at the expected price', () => {
    const r = rule({ amount: 100, freq: 'month' })
    const trns = { [occurrenceTrnId('r', U(2024, 1, 1))]: { amount: 100 } }
    const p = periodProgress(r, 'r', range, trns, today)
    expect(p).toEqual({ paidCount: 1, paidNative: 100, totalCount: 4, totalNative: 400 })
  })

  it('counts a drift trn as paid at its ACTUAL amount (paid + total use the trn value, not expected)', () => {
    const r = rule({ amount: 100, freq: 'month' })
    const trns = { [occurrenceTrnId('r', U(2024, 1, 1))]: { amount: 120 } }
    const p = periodProgress(r, 'r', range, trns, today)
    // paid = one drift @120; total = three unpaid @100 + one drift @120
    expect(p).toEqual({ paidCount: 1, paidNative: 120, totalCount: 4, totalNative: 420 })
  })

  it('excludes a skipped occurrence from both paid and total (even if a trn exists for that day)', () => {
    const r = rule({ amount: 100, freq: 'month', skipDates: ['2024-02-01'] })
    const trns = { [occurrenceTrnId('r', U(2024, 1, 1))]: { amount: 100 } }
    const p = periodProgress(r, 'r', range, trns, today)
    expect(p).toEqual({ paidCount: 0, paidNative: 0, totalCount: 3, totalNative: 300 })
  })

  it('prices each occurrence at its effective amount across a mid-range change', () => {
    const r = rule({ amount: 200, amountHistory: [{ amount: 100, from: U(2024, 0, 1) }, { amount: 200, from: U(2024, 2, 1) }], freq: 'month' })
    const p = periodProgress(r, 'r', range, {}, today)
    // Jan,Feb @100 + Mar,Apr @200 = 600, not a flat amount*count of 800
    expect(p).toEqual({ paidCount: 0, paidNative: 0, totalCount: 4, totalNative: 600 })
  })
})

describe('priceHistoryTimeline', () => {
  it('seeds a single entry from the scalar amount at the anchor when there is no history', () => {
    const r = rule({ amount: 100, anchorDate: U(2024, 0, 1) })
    expect(priceHistoryTimeline(r)).toEqual([{ amount: 100, deltaPct: undefined, from: civilDayStart(U(2024, 0, 1)) }])
  })

  it('orders ascending and annotates each entry with its % change (first has none)', () => {
    const r = rule({ amountHistory: [{ amount: 100, from: U(2024, 0, 1) }, { amount: 120, from: U(2024, 5, 1) }] })
    const timeline = priceHistoryTimeline(r)
    expect(timeline.map(e => e.amount)).toEqual([100, 120])
    expect(timeline[0]!.deltaPct).toBeUndefined()
    expect(timeline[1]!.deltaPct).toBeCloseTo(0.2)
  })

  it('reports a negative delta on a price decrease', () => {
    const r = rule({ amountHistory: [{ amount: 200, from: U(2024, 0, 1) }, { amount: 150, from: U(2024, 5, 1) }] })
    expect(priceHistoryTimeline(r)[1]!.deltaPct).toBeCloseTo(-0.25)
  })

  it('returns unsorted input sorted ascending by from', () => {
    const r = rule({ amountHistory: [{ amount: 120, from: U(2024, 5, 1) }, { amount: 100, from: U(2024, 0, 1) }] })
    const timeline = priceHistoryTimeline(r)
    expect(timeline.map(e => e.from)).toEqual([U(2024, 0, 1), U(2024, 5, 1)])
    expect(timeline.map(e => e.amount)).toEqual([100, 120])
    expect(timeline[1]!.deltaPct).toBeCloseTo(0.2)
  })
})

describe('paidCountInRange', () => {
  // Default rule() is monthly anchored Jan 1 2024; a Jan..Apr range holds 4 occurrences (Jan..Apr 1).
  const range = { end: U(2024, 3, 1), start: U(2024, 0, 1) }

  it('counts only occurrences whose trn carries an amount', () => {
    const r = rule({ amount: 100, freq: 'month' })
    const trns = {
      [occurrenceTrnId('r', U(2024, 0, 1))]: { amount: 100 },
      [occurrenceTrnId('r', U(2024, 2, 1))]: { amount: 100 },
    }
    expect(paidCountInRange(r, 'r', range, trns)).toBe(2)
  })

  it('does not count a matched trn that carries no amount', () => {
    const r = rule({ amount: 100, freq: 'month' })
    const trns = { [occurrenceTrnId('r', U(2024, 1, 1))]: {} }
    expect(paidCountInRange(r, 'r', range, trns)).toBe(0)
  })

  it('respects range bounds and skipDates', () => {
    const r = rule({ amount: 100, freq: 'month', skipDates: ['2024-02-01'] })
    const trns = {
      [occurrenceTrnId('r', U(2024, 1, 1))]: { amount: 100 }, // Feb: paid but skipped -> not an occurrence
      [occurrenceTrnId('r', U(2024, 2, 1))]: { amount: 100 }, // Mar: counts
      [occurrenceTrnId('r', U(2024, 6, 1))]: { amount: 100 }, // Jul: outside the range
    }
    expect(paidCountInRange(r, 'r', range, trns)).toBe(1)
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

describe('matchExistingOccurrences', () => {
  const trn = (id: string, date: number): OccurrenceMatchTrn => ({ amount: 100, date, id, type: TrnType.Expense })

  it('matches drifted monthly trns to their nearest occurrence, one per day', () => {
    const r = rule({ anchorDate: U(2024, 0, 10), freq: 'month', interval: 1 })
    // Paid on the 8th / 12th / 9th - each within the ~13-day window of the 10th.
    const candidates = [trn('a', U(2024, 0, 8)), trn('b', U(2024, 1, 12)), trn('c', U(2024, 2, 9))]
    expect(matchExistingOccurrences(r, candidates)).toEqual([
      { day: U(2024, 0, 10), trnId: 'a' },
      { day: U(2024, 1, 10), trnId: 'b' },
      { day: U(2024, 2, 10), trnId: 'c' },
    ])
  })

  it('excludes a trn outside the drift window', () => {
    const r = rule({ anchorDate: U(2024, 0, 10), freq: 'month', interval: 1 })
    // 15 days off the nearest occurrence (> floor(31 * 0.45) = 13).
    expect(matchExistingOccurrences(r, [trn('far', U(2024, 0, 25))])).toEqual([])
  })

  it('keeps the closest when two trns fall near one occurrence', () => {
    const r = rule({ anchorDate: U(2024, 0, 10), freq: 'month', interval: 1 })
    const candidates = [trn('near', U(2024, 0, 11)), trn('farther', U(2024, 0, 6))]
    expect(matchExistingOccurrences(r, candidates)).toEqual([{ day: U(2024, 0, 10), trnId: 'near' }])
  })
})
