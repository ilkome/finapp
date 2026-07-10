import { describe, expect, it } from 'vitest'

import type { Categories } from '~/components/categories/types'

import type { ReduceCandidateInput } from './compute'

import {
  applyRollover,
  assignedPoolContribution,
  budgetOwnedCategoryIds,
  carriedIn,
  computeAvailable,
  greedyReduceCuts,
  isGoalReached,
  isOverBudget,
  movableAmount,
  normalizeAmount,
  paceMarker,
  periodsUntilGoal,
  projectedPeriodEnd,
  reduceCandidates,
  reducedAssignment,
  safeToSpend,
  targetSaved,
  targetSetAside,
  toAssignPool,
} from './compute'

// Civil-day epochs (UTC midnight) used by the target-by-date math.
const JAN_1 = Date.UTC(2026, 0, 1)
const APR_1 = Date.UTC(2026, 3, 1)
const DEC_1 = Date.UTC(2026, 11, 1)

function cat(parentId: string | 0): Categories[string] {
  return { color: '#fff', icon: 'i', name: 'n', parentId, showInLastUsed: true, showInQuickSelector: false }
}

describe('normalizeAmount', () => {
  it('same cadence is unchanged', () => {
    expect(normalizeAmount(100, 'month', 'month')).toBe(100)
  })
  it('year -> month divides by 12', () => {
    expect(normalizeAmount(1200, 'year', 'month')).toBe(100)
  })
  it('month -> week uses 12/52', () => {
    expect(normalizeAmount(100, 'month', 'week')).toBeCloseTo(23.08, 2)
  })
  it('week -> month uses 52/12', () => {
    expect(normalizeAmount(50, 'week', 'month')).toBeCloseTo(216.67, 2)
  })
  it('round-trips back to the original cadence', () => {
    expect(normalizeAmount(normalizeAmount(1200, 'year', 'week'), 'week', 'year')).toBeCloseTo(1200, 6)
  })
})

describe('computeAvailable', () => {
  it('available = carriedIn + assigned - activity', () => {
    expect(computeAvailable(0, 1000, 300)).toBe(700)
    expect(computeAvailable(200, 1000, 300)).toBe(900)
    expect(computeAvailable(0, 1000, 1300)).toBe(-300)
  })
})

describe('isOverBudget', () => {
  it('expense is over only when available is negative', () => {
    expect(isOverBudget('expense', -1)).toBe(true)
    expect(isOverBudget('expense', 0)).toBe(false)
    expect(isOverBudget('expense', 100)).toBe(false)
  })
  it('income is never over - receiving more than expected is the goal, not a problem', () => {
    expect(isOverBudget('income', -500)).toBe(false)
    expect(isOverBudget('income', 100)).toBe(false)
  })
})

describe('isGoalReached', () => {
  it('income goal is reached once received meets or beats expected', () => {
    expect(isGoalReached('income', 1000, 999)).toBe(false)
    expect(isGoalReached('income', 1000, 1000)).toBe(true)
    expect(isGoalReached('income', 1000, 1500)).toBe(true)
  })
  it('a zero/absent target is never reached', () => {
    expect(isGoalReached('income', 0, 0)).toBe(false)
  })
  it('expense budgets are never a goal', () => {
    expect(isGoalReached('expense', 1000, 2000)).toBe(false)
  })
})

describe('periodsUntilGoal', () => {
  it('counts whole months to the goal', () => {
    expect(periodsUntilGoal(JAN_1, DEC_1, 'month')).toBe(11)
    expect(periodsUntilGoal(JAN_1, APR_1, 'month')).toBe(3)
  })
  it('clamps to at least 1 for a goal in the current or a past period', () => {
    expect(periodsUntilGoal(JAN_1, JAN_1, 'month')).toBe(1)
    expect(periodsUntilGoal(APR_1, JAN_1, 'month')).toBe(1)
  })
  it('respects the period type', () => {
    expect(periodsUntilGoal(JAN_1, DEC_1, 'year')).toBe(1)
    // Jan 1 -> Apr 1 2026 spans 13 calendar-week boundaries.
    expect(periodsUntilGoal(JAN_1, APR_1, 'week')).toBe(13)
  })
})

describe('targetSetAside', () => {
  it('spreads the goal evenly across the remaining periods', () => {
    expect(targetSetAside(1100, JAN_1, DEC_1, 'month')).toBe(100)
    expect(targetSetAside(1200, JAN_1, APR_1, 'month')).toBe(400)
  })
  it('asks for the full amount when the goal is due this period', () => {
    expect(targetSetAside(500, JAN_1, JAN_1, 'month')).toBe(500)
  })
})

describe('targetSaved', () => {
  it('income accumulates received income (funding ignored)', () => {
    expect(targetSaved('income', { activity: 300, fundedThisPeriod: 0, priorSaved: 700 })).toBe(1000)
  })
  it('income never subtracts receipts, even with a stray fundedThisPeriod', () => {
    expect(targetSaved('income', { activity: 100, fundedThisPeriod: 999, priorSaved: 0 })).toBe(100)
  })
  it('expense = priorSaved + funded - spend', () => {
    expect(targetSaved('expense', { activity: 200, fundedThisPeriod: 400, priorSaved: 500 })).toBe(700)
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

describe('movableAmount', () => {
  it('moves the full request when the source available covers it', () => {
    expect(movableAmount(500, 200)).toBe(200)
  })
  it('caps the move at the source available so already-spent money is never moved', () => {
    // e.g. assigned 1000 but only 50 available (950 spent): at most 50 can leave.
    expect(movableAmount(50, 150)).toBe(50)
  })
  it('never returns a negative amount (source already overspent)', () => {
    expect(movableAmount(0, 100)).toBe(0)
    expect(movableAmount(-10, 100)).toBe(0)
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

describe('assignedPoolContribution', () => {
  it('a plain expense budget contributes its assigned amount', () => {
    expect(assignedPoolContribution({ assigned: 500, hasAssignment: false, isTarget: false })).toBe(500)
  })
  it('an unfunded target contributes 0 - its synthetic set-aside never entered the pool', () => {
    expect(assignedPoolContribution({ assigned: 450, hasAssignment: false, isTarget: true })).toBe(0)
  })
  it('a funded target contributes exactly its explicit funding', () => {
    expect(assignedPoolContribution({ assigned: 300, hasAssignment: true, isTarget: true })).toBe(300)
  })
  it('an explicit override on a plain budget still contributes assigned', () => {
    expect(assignedPoolContribution({ assigned: 250, hasAssignment: true, isTarget: false })).toBe(250)
  })
})

describe('reduceCandidates', () => {
  it('lists expense budgets most-assigned first', () => {
    const inputs: ReduceCandidateInput[] = [
      { assigned: 200, hasAssignment: false, id: 'b', isTarget: false, kind: 'expense' },
      { assigned: 800, hasAssignment: false, id: 'a', isTarget: false, kind: 'expense' },
      { assigned: 500, hasAssignment: false, id: 'c', isTarget: false, kind: 'expense' },
    ]
    expect(reduceCandidates(inputs)).toEqual([
      { assigned: 800, id: 'a' },
      { assigned: 500, id: 'c' },
      { assigned: 200, id: 'b' },
    ])
  })
  it('excludes income budgets even with assigned > 0', () => {
    expect(reduceCandidates([{ assigned: 900, hasAssignment: false, id: 'salary', isTarget: false, kind: 'income' }]))
      .toEqual([])
  })
  it('excludes unfunded targets, keeps funded ones', () => {
    const inputs: ReduceCandidateInput[] = [
      { assigned: 450, hasAssignment: false, id: 'car_unfunded', isTarget: true, kind: 'expense' },
      { assigned: 300, hasAssignment: true, id: 'vacation_funded', isTarget: true, kind: 'expense' },
    ]
    expect(reduceCandidates(inputs)).toEqual([{ assigned: 300, id: 'vacation_funded' }])
  })
  it('drops zero assignments', () => {
    expect(reduceCandidates([{ assigned: 0, hasAssignment: false, id: 'idle', isTarget: false, kind: 'expense' }]))
      .toEqual([])
  })
  it('drops negative assignments (moveMoney with rollover carry can drive a raw assignment below 0)', () => {
    expect(reduceCandidates([{ assigned: -200, hasAssignment: true, id: 'drained', isTarget: false, kind: 'expense' }]))
      .toEqual([])
  })
})

describe('greedyReduceCuts', () => {
  const candidates = [{ assigned: 500, id: 'a' }, { assigned: 200, id: 'b' }]

  it('takes the whole cut from the largest candidate when it covers the overage', () => {
    expect(greedyReduceCuts(300, candidates)).toEqual([{ cut: 300, id: 'a' }])
  })
  it('spans candidates largest-first until balanced', () => {
    expect(greedyReduceCuts(600, candidates)).toEqual([{ cut: 500, id: 'a' }, { cut: 100, id: 'b' }])
  })
  it('cuts everything when candidates run out', () => {
    const cuts = greedyReduceCuts(1000, candidates)
    expect(cuts).toEqual([{ cut: 500, id: 'a' }, { cut: 200, id: 'b' }])
    expect(cuts.reduce((s, c) => s + c.cut, 0)).toBe(700)
  })
  it('never cuts more than a candidate has assigned', () => {
    for (const { cut, id } of greedyReduceCuts(1000, candidates))
      expect(cut).toBeLessThanOrEqual(candidates.find(c => c.id === id)!.assigned)
  })
  it('treats sub-half-cent residue as balanced', () => {
    expect(greedyReduceCuts(0.004, candidates)).toEqual([])
    expect(greedyReduceCuts(0.006, candidates)).toEqual([{ cut: 0.006, id: 'a' }])
  })
  it('returns no cuts for a balanced or positive pool', () => {
    expect(greedyReduceCuts(0, candidates)).toEqual([])
    expect(greedyReduceCuts(-100, candidates)).toEqual([])
  })
  it('returns no cuts with no candidates', () => {
    expect(greedyReduceCuts(300, [])).toEqual([])
  })
})

describe('reducedAssignment', () => {
  it('subtracts the delta from the raw assignment', () => {
    expect(reducedAssignment(500, 200)).toBe(300)
  })
  it('floors at 0 when the delta exceeds the raw assignment', () => {
    expect(reducedAssignment(100, 250)).toBe(0)
  })
  it('an exact drain hits 0', () => {
    expect(reducedAssignment(200, 200)).toBe(0)
  })
  it('reduces regardless of spend - the floor is on raw, not available', () => {
    // A fully-spent budget can still free its assignment back to the pool (available goes negative).
    expect(reducedAssignment(400, 150)).toBe(250)
  })
})

describe('reduce-assignment mirrors toAssignTotal', () => {
  const budgets: ReduceCandidateInput[] = [
    { assigned: 800, hasAssignment: false, id: 'food', isTarget: false, kind: 'expense' },
    { assigned: 300, hasAssignment: true, id: 'vacation_funded', isTarget: true, kind: 'expense' },
    { assigned: 450, hasAssignment: false, id: 'car_unfunded', isTarget: true, kind: 'expense' },
    { assigned: 900, hasAssignment: false, id: 'salary', isTarget: false, kind: 'income' },
  ]
  // What toAssignTotal subtracts from the pool: 800 (plain) + 300 (funded target) = 1100.
  const totalAssigned = budgets
    .filter(b => b.kind === 'expense')
    .reduce((s, b) => s + assignedPoolContribution(b), 0)

  it('candidate contributions sum to exactly what the pool subtracts', () => {
    expect(reduceCandidates(budgets).reduce((s, c) => s + c.assigned, 0)).toBe(totalAssigned)
  })

  it('greedy cuts cancel the over-assignment and rebalance the pool to 0', () => {
    const income = 400
    const over = -toAssignPool(income, totalAssigned) // 700 over-assigned
    const cuts = greedyReduceCuts(over, reduceCandidates(budgets))
    const cutTotal = cuts.reduce((s, c) => s + c.cut, 0)
    expect(cutTotal).toBeCloseTo(over, 9)
    expect(toAssignPool(income, totalAssigned - cutTotal)).toBeCloseTo(0, 9)
  })

  it('a negative assignment shrinks the pool but not the candidates, and greedy still covers the overage', () => {
    const withNegative: ReduceCandidateInput[] = [
      ...budgets,
      { assigned: -200, hasAssignment: true, id: 'drained', isTarget: false, kind: 'expense' },
    ]
    // The pool counts the negative contribution (900); candidates skip it, so they can cover more.
    const negTotal = withNegative
      .filter(b => b.kind === 'expense')
      .reduce((s, b) => s + assignedPoolContribution(b), 0)
    const listed = reduceCandidates(withNegative)
    expect(listed.reduce((s, c) => s + c.assigned, 0)).toBeGreaterThan(negTotal)
    const over = -toAssignPool(400, negTotal) // 500 over-assigned
    const cuts = greedyReduceCuts(over, listed)
    expect(cuts.reduce((s, c) => s + c.cut, 0)).toBeCloseTo(over, 9)
  })
})
