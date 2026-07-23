import { describe, expect, it } from 'vitest'

import type { RecurrenceItem } from '~/components/recurrences/types'

import { upcomingReminders } from '~/components/recurrences/reminders'
import { TrnType } from '~/components/trns/types'

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

describe('upcomingReminders - due rows (unchanged)', () => {
  it('emits due rows at offsets 3/1/0 for a past-anchored monthly rule', () => {
    const today = U(2024, 5, 15)
    // Only Jul 1 falls in [today, today + 45d]; Jun 1 is past, Aug 1 beyond the horizon.
    const rows = upcomingReminders({ r: rule({ anchorDate: U(2024, 0, 1) }) }, today)
    expect(rows).toHaveLength(3)
    expect(rows.every(x => x.kind === 'due')).toBe(true)
    expect(rows.map(x => x.id).sort()).toEqual(['r:2024-07-01:0', 'r:2024-07-01:1', 'r:2024-07-01:3'])
  })
})

describe('upcomingReminders - paid occurrences', () => {
  it('emits no due rows for an occurrence already materialized (paid early)', () => {
    const today = U(2024, 5, 15)
    const rows = upcomingReminders({ r: rule({ anchorDate: U(2024, 0, 1) }) }, today, { 'r:2024-07-01': {} })
    expect(rows).toHaveLength(0)
  })

  it('emits no firstCharge once the anchor charge is paid', () => {
    const today = U(2024, 5, 15)
    const rows = upcomingReminders({ r: rule({ anchorDate: U(2024, 5, 25) }) }, today, { 'r:2024-06-25': {} })
    expect(rows.some(x => x.kind === 'firstCharge')).toBe(false)
  })

  it('emits no priceHike once the first re-priced charge is paid', () => {
    const today = U(2024, 5, 15)
    const rows = upcomingReminders({
      r: rule({
        amount: 600,
        amountHistory: [{ amount: 500, from: U(2024, 0, 1) }, { amount: 600, from: U(2024, 6, 1) }],
        anchorDate: U(2024, 0, 1),
      }),
    }, today, { 'r:2024-07-01': {} })
    expect(rows.some(x => x.kind === 'priceHike')).toBe(false)
  })

  it('leaves other occurrences alone', () => {
    const today = U(2024, 5, 15)
    const rows = upcomingReminders({ r: rule({ anchorDate: U(2024, 0, 1) }) }, today, { 'r:2024-08-01': {} })
    expect(rows.map(x => x.id).sort()).toEqual(['r:2024-07-01:0', 'r:2024-07-01:1', 'r:2024-07-01:3'])
  })
})

describe('upcomingReminders - firstCharge', () => {
  it('fires the lead time before a future anchor more than the lead time out', () => {
    const today = U(2024, 5, 15)
    const first = upcomingReminders({ r: rule({ anchorDate: U(2024, 5, 25) }) }, today)
      .filter(x => x.kind === 'firstCharge')
    expect(first).toHaveLength(1)
    expect(first[0]).toMatchObject({
      fireDate: U(2024, 5, 18), // Jun 25 - 7 days
      id: 'r:first:2024-06-25',
      kind: 'firstCharge',
      occ: U(2024, 5, 25),
      offset: 7,
      ruleId: 'r',
    })
  })

  it('clamps the fireDate to today for a near anchor (< lead time out)', () => {
    const today = U(2024, 5, 15)
    const first = upcomingReminders({ r: rule({ anchorDate: U(2024, 5, 18) }) }, today) // today + 3
      .filter(x => x.kind === 'firstCharge')
    expect(first).toHaveLength(1)
    expect(first[0]).toMatchObject({ fireDate: today, occ: U(2024, 5, 18), offset: 3 })
  })

  it('emits no firstCharge for a past anchor (already started charging)', () => {
    const today = U(2024, 5, 15)
    const rows = upcomingReminders({ r: rule({ anchorDate: U(2024, 0, 1) }) }, today)
    expect(rows.some(x => x.kind === 'firstCharge')).toBe(false)
  })
})

describe('upcomingReminders - priceHike', () => {
  it('fires when the latest amount-history entry is higher and its first charge is upcoming', () => {
    const today = U(2024, 5, 15)
    const hike = upcomingReminders({
      r: rule({
        amount: 600,
        amountHistory: [{ amount: 500, from: U(2024, 0, 1) }, { amount: 600, from: U(2024, 6, 1) }],
        anchorDate: U(2024, 0, 1),
      }),
    }, today).filter(x => x.kind === 'priceHike')
    expect(hike).toHaveLength(1)
    expect(hike[0]).toMatchObject({
      amount: 600,
      fireDate: U(2024, 5, 24), // Jul 1 - 7 days
      id: 'r:hike:2024-07-01',
      kind: 'priceHike',
      occ: U(2024, 6, 1),
      offset: 7,
      previousAmount: 500,
      ruleId: 'r',
    })
  })

  it('emits no priceHike for a price decrease', () => {
    const today = U(2024, 5, 15)
    const rows = upcomingReminders({
      r: rule({
        amount: 500,
        amountHistory: [{ amount: 600, from: U(2024, 0, 1) }, { amount: 500, from: U(2024, 6, 1) }],
        anchorDate: U(2024, 0, 1),
      }),
    }, today)
    expect(rows.some(x => x.kind === 'priceHike')).toBe(false)
  })

  it('emits no priceHike when the first higher charge is already in the past', () => {
    const today = U(2024, 5, 15)
    const rows = upcomingReminders({
      r: rule({
        amount: 600,
        amountHistory: [{ amount: 500, from: U(2024, 0, 1) }, { amount: 600, from: U(2024, 4, 1) }],
        anchorDate: U(2024, 0, 1),
      }),
    }, today)
    expect(rows.some(x => x.kind === 'priceHike')).toBe(false)
  })

  it('emits no priceHike with fewer than two price entries', () => {
    const today = U(2024, 5, 15)
    const rows = upcomingReminders({
      r: rule({ amount: 600, amountHistory: [{ amount: 600, from: U(2024, 6, 1) }], anchorDate: U(2024, 0, 1) }),
    }, today)
    expect(rows.some(x => x.kind === 'priceHike')).toBe(false)
  })
})

describe('upcomingReminders - ids', () => {
  it('produces distinct ids across kinds (firstCharge coexists with its overlapping due rows)', () => {
    const today = U(2024, 5, 15)
    const ids = upcomingReminders({ r: rule({ anchorDate: U(2024, 5, 25) }) }, today).map(x => x.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toContain('r:first:2024-06-25')
    expect(ids).toContain('r:2024-06-25:0')
  })
})
