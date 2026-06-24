import { describe, expect, it } from 'vitest'

import type { Categories } from '~/components/categories/types'

import {
  applyRollover,
  budgetOwnedCategoryIds,
  carriedIn,
  computeAvailable,
  paceMarker,
  projectedPeriodEnd,
  safeToSpend,
  toAssignPool,
} from './compute'

function cat(parentId: string | 0): Categories[string] {
  return { color: '#fff', icon: 'i', name: 'n', parentId, showInLastUsed: true, showInQuickSelector: false }
}

describe('computeAvailable', () => {
  it('available = carriedIn + assigned - activity', () => {
    expect(computeAvailable(0, 1000, 300)).toBe(700)
    expect(computeAvailable(200, 1000, 300)).toBe(900)
    expect(computeAvailable(0, 1000, 1300)).toBe(-300)
  })
})

describe('applyRollover', () => {
  it('none never carries', () => {
    expect(applyRollover('none', 500)).toBe(0)
    expect(applyRollover('none', -500)).toBe(0)
  })
  it('surplus carries only positive leftover', () => {
    expect(applyRollover('surplus', 500)).toBe(500)
    expect(applyRollover('surplus', -500)).toBe(0)
  })
  it('surplus_deficit carries both', () => {
    expect(applyRollover('surplus_deficit', 500)).toBe(500)
    expect(applyRollover('surplus_deficit', -500)).toBe(-500)
  })
})

describe('carriedIn', () => {
  const periodStarts = [1, 2, 3]
  const assignedForPeriod = () => 1000
  // period 1 spends 600 (surplus 400), period 2 spends 1200 (deficit 200), period 3 spends 1000
  const activity: Record<number, number> = { 1: 600, 2: 1200, 3: 1000 }
  const activityForPeriod = (ps: number) => activity[ps] ?? 0

  it('none -> 0 regardless of history', () => {
    expect(carriedIn({ activityForPeriod, assignedForPeriod, periodStarts, rollover: 'none' })).toBe(0)
  })

  it('surplus accumulates positive leftovers, clamps deficits to 0 each step', () => {
    // p1: 0+1000-600=400 -> 400; p2: 400+1000-1200=200 -> 200; p3: 200+1000-1000=200 -> 200
    expect(carriedIn({ activityForPeriod, assignedForPeriod, periodStarts, rollover: 'surplus' })).toBe(200)
  })

  it('surplus_deficit carries overspend through', () => {
    // p1: 400; p2: 400+1000-1200=200; p3: 200+1000-1000=200
    expect(carriedIn({ activityForPeriod, assignedForPeriod, periodStarts, rollover: 'surplus_deficit' })).toBe(200)
  })

  it('surplus_deficit can go negative when overspend dominates', () => {
    const heavy: Record<number, number> = { 1: 2000, 2: 2000, 3: 0 }
    // p1: 0+1000-2000=-1000; p2: -1000+1000-2000=-2000; p3: -2000+1000-0=-1000
    expect(carriedIn({
      activityForPeriod: ps => heavy[ps] ?? 0,
      assignedForPeriod,
      periodStarts,
      rollover: 'surplus_deficit',
    })).toBe(-1000)
  })
})

describe('safeToSpend & toAssignPool', () => {
  it('safeToSpend subtracts committed recurring', () => {
    expect(safeToSpend(1500, 400)).toBe(1100)
  })
  it('toAssignPool = income + carried - assigned', () => {
    expect(toAssignPool(3000, 2500)).toBe(500)
    expect(toAssignPool(3000, 2500, 200)).toBe(700)
  })
})

describe('budgetOwnedCategoryIds', () => {
  // root -> food -> (groceries, cafe); cafe -> cafe_coffee
  const categories: Categories = {
    cafe: cat('food'),
    cafe_coffee: cat('cafe'),
    food: cat(0),
    groceries: cat('food'),
    transfer: cat(0),
  }

  it('a leaf budget owns just itself', () => {
    expect(budgetOwnedCategoryIds(categories, 'groceries', new Set(['groceries'])).sort())
      .toEqual(['groceries'])
  })

  it('a parent budget owns its whole subtree when no descendant is budgeted', () => {
    expect(budgetOwnedCategoryIds(categories, 'food', new Set(['food'])).sort())
      .toEqual(['cafe', 'cafe_coffee', 'food', 'groceries'])
  })

  it('a parent excludes a self-budgeted descendant and its subtree', () => {
    // cafe has its own budget -> food owns food + groceries only (cafe + cafe_coffee belong to cafe)
    expect(budgetOwnedCategoryIds(categories, 'food', new Set(['food', 'cafe'])).sort())
      .toEqual(['food', 'groceries'])
  })
})

describe('projectedPeriodEnd & paceMarker', () => {
  it('projects from run-rate', () => {
    expect(projectedPeriodEnd(300, 10, 30)).toBe(900)
    expect(projectedPeriodEnd(300, 0, 30)).toBe(300) // no days elapsed -> current activity
  })
  it('pace marker scales assigned by elapsed fraction, clamped to the period', () => {
    expect(paceMarker(900, 10, 30)).toBe(300)
    expect(paceMarker(900, 40, 30)).toBe(900) // clamp elapsed to period
    expect(paceMarker(900, 10, 0)).toBe(0)
  })
})
