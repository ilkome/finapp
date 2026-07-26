import { UTCDate } from '@date-fns/utc'
import { add, differenceInCalendarMonths, differenceInCalendarWeeks, differenceInCalendarYears } from 'date-fns'

import type { BudgetId, BudgetKind, BudgetPeriodType, BudgetRollover } from '~/components/budgets/types'
import type { Categories, CategoryId } from '~/components/categories/types'

import { getCategorySubtreeIds } from '~/components/categories/utils'
import { getStartOf, toDuration } from '~~/utils/date/period'

// Calendar-average occurrences per year, used to convert a budget amount between cadences. Fixed
// factors (like Goodbudget/Actual) keep the conversion stable and predictable rather than depending
// on the day count of a specific week/month.
const PERIODS_PER_YEAR: Record<BudgetPeriodType, number> = { month: 12, week: 52, year: 1 }

/**
 * Re-express an amount stated per `from` cadence as the equivalent per `to` cadence.
 * E.g. 1200/year -> 100/month; 50/week -> ~216.67/month. See plans/budgets-period-redesign.md.
 */
export function normalizeAmount(amount: number, from: BudgetPeriodType, to: BudgetPeriodType): number {
  if (from === to)
    return amount
  return amount * (PERIODS_PER_YEAR[from] / PERIODS_PER_YEAR[to])
}

// Pure budget math (see plans/budgets.md §5, §7). Store-bound aggregation (getTotal over trns,
// occurrence counting) is supplied via callbacks/inputs so everything here stays testable.

/** `available = carriedIn + assigned - activity` (activity is positive spend for expense budgets). */
export function computeAvailable(carriedIn: number, assigned: number, activity: number): number {
  return carriedIn + assigned - activity
}

/**
 * "Bad overage" state. Only an expense budget can be over-budget; for an income budget, receiving
 * more than expected is the goal, not a problem - so income is never flagged over. See [[budgets]].
 */
export function isOverBudget(kind: BudgetKind, available: number): boolean {
  return kind === 'expense' && available < 0
}

/** Income budgets are goals: reached once received (activity) meets or beats the expected amount. */
export function isGoalReached(kind: BudgetKind, assigned: number, activity: number): boolean {
  return kind === 'income' && assigned > 0 && activity >= assigned
}

/**
 * Carry resulting from one period's leftover, per the rollover rule.
 * `priorAvailable` is signed: positive = surplus, negative = overspend.
 * - `none` -> nothing carries.
 * - `surplus` -> only positive leftover carries.
 * - `surplus_deficit` -> both surplus and overspend carry.
 */
export function applyRollover(rollover: BudgetRollover, priorAvailable: number): number {
  if (rollover === 'none')
    return 0
  if (rollover === 'surplus')
    return Math.max(0, priorAvailable)
  return priorAvailable
}

/**
 * Carried-in amount for the target period: walk the earlier `periodStarts` (ascending, excluding
 * the target) accumulating the carry. `assignedForPeriod` / `activityForPeriod` are callbacks so
 * the caller owns aggregation while this stays pure. Budget history is small (categories x months),
 * so recomputing on the fly avoids a cached column going stale offline.
 */
export function carriedIn(opts: {
  activityForPeriod: (periodStart: number) => number
  assignedForPeriod: (periodStart: number) => number
  periodStarts: number[]
  rollover: BudgetRollover
}): number {
  const { activityForPeriod, assignedForPeriod, periodStarts, rollover } = opts
  if (rollover === 'none')
    return 0

  let carried = 0
  for (const ps of periodStarts) {
    const priorAvailable = carried + assignedForPeriod(ps) - activityForPeriod(ps)
    carried = applyRollover(rollover, priorAvailable)
  }
  return carried
}

/**
 * Ascending period starts stepping by `periodType`, from the period containing `fromMs` up to but
 * EXCLUDING the period containing `toExclusiveMs`. Boundaries use the same UTC civil rules as the
 * period range (getStartOf; weeks start Monday). Deliberately unbounded: a target-by-date walk must
 * cover the budget's whole real history, or the oldest contributions silently fall out of a capped
 * window and "saved" regresses with no user action.
 */
export function periodStartsFrom(fromMs: number, toExclusiveMs: number, periodType: BudgetPeriodType): number[] {
  const bound = getStartOf(new UTCDate(toExclusiveMs), periodType).getTime()
  const starts: number[] = []
  // Cursor stays on exact period starts, so stepping by one period needs no re-normalization.
  let cursor = getStartOf(new UTCDate(fromMs), periodType).getTime()
  while (cursor < bound) {
    starts.push(cursor)
    cursor = add(new UTCDate(cursor), toDuration(periodType, 1)).getTime()
  }
  return starts
}

/**
 * Safe-to-spend: discretionary remainder after committed recurring spend.
 * `sum(available over expense budgets) - committedRemaining`.
 */
export function safeToSpend(expenseAvailableSum: number, committedRemaining: number): number {
  return expenseAvailableSum - committedRemaining
}

/** Envelope To-Assign pool: period income (plus any carried pool) minus what's already assigned. */
export function toAssignPool(incomeForPeriod: number, totalAssigned: number, carriedPool = 0): number {
  return incomeForPeriod + carriedPool - totalAssigned
}

export type ToAssignCardState = 'hidden' | 'planOnly' | 'pool'

/**
 * How the hero to-assign card presents itself. Real income drives the pool regardless of sign;
 * without income the pool is just -assigned, so the card reframes to the plan ("Assigned so far")
 * instead of hiding or faking a deficit; with neither there is nothing honest to show. planOnly is
 * reachable for any plain expense limit because rawAssigned falls back to the normalized budget
 * amount (useBudgetProgress), while targets without explicit funding contribute 0
 * (assignedPoolContribution).
 */
export function toAssignCardState(periodIncome: number, assignedPool: number): ToAssignCardState {
  if (periodIncome > 0)
    return 'pool'
  if (assignedPool > 0)
    return 'planOnly'
  return 'hidden'
}

/**
 * Amount actually movable out of a budget: never more than `cap` (the source's AVAILABLE balance,
 * not its assignment - so already-spent money can't be moved), never negative. Move-money must
 * conserve: the destination receives exactly what the source gives up.
 */
export function movableAmount(cap: number, requested: number): number {
  return Math.max(0, Math.min(requested, cap))
}

/**
 * Category ids a budget owns for activity aggregation: its subtree EXCEPT any descendant that has
 * its own budget (that descendant - and its whole subtree - is owned by that budget, so it is
 * never double-counted in the parent). See plans/budgets.md §5 "Overlapping budgets rule".
 */
export function budgetOwnedCategoryIds(
  categories: Categories,
  budgetCategoryId: CategoryId,
  budgetedCategoryIds: Set<CategoryId>,
): CategoryId[] {
  const subtree = getCategorySubtreeIds(categories, budgetCategoryId)

  const excluded = new Set<CategoryId>()
  for (const id of subtree) {
    if (id !== budgetCategoryId && budgetedCategoryIds.has(id)) {
      for (const sub of getCategorySubtreeIds(categories, id))
        excluded.add(sub)
    }
  }

  return subtree.filter(id => !excluded.has(id))
}

/**
 * Run-rate projection of period-end spend from elapsed days: `activity / daysElapsed * daysInPeriod`.
 * Before any day elapses, falls back to current activity (no division by zero).
 */
export function projectedPeriodEnd(activity: number, daysElapsed: number, daysInPeriod: number): number {
  if (daysElapsed <= 0)
    return activity
  return (activity / daysElapsed) * daysInPeriod
}

/** Pace marker position on the bar: `assigned * daysElapsed / daysInPeriod` (expected spend so far). */
export function paceMarker(assigned: number, daysElapsed: number, daysInPeriod: number): number {
  if (daysInPeriod <= 0)
    return 0
  return assigned * (Math.min(daysElapsed, daysInPeriod) / daysInPeriod)
}

/**
 * Whole periods from `fromMs` to `goalMs`, clamped to >= 1 so a target always has a fundable
 * per-period set-aside (a goal due this period, or already past, still asks for the full amount once).
 */
export function periodsUntilGoal(fromMs: number, goalMs: number, periodType: BudgetPeriodType): number {
  const from = new UTCDate(fromMs)
  const to = new UTCDate(goalMs)
  const diff = periodType === 'year'
    ? differenceInCalendarYears(to, from)
    : periodType === 'week'
      ? differenceInCalendarWeeks(to, from)
      : differenceInCalendarMonths(to, from)
  return Math.max(1, diff)
}

/**
 * Sinking-fund set-aside: how much to put aside each period to reach `goalAmount` by `goalMs`,
 * counting from `fromMs`. Flat division (does not re-spread what's already saved), so it stays a
 * pure function of the goal and the calendar. See plans/budgets-recurrences-improvements.md (1.2).
 */
export function targetSetAside(goalAmount: number, fromMs: number, goalMs: number, periodType: BudgetPeriodType): number {
  return goalAmount / periodsUntilGoal(fromMs, goalMs, periodType)
}

/**
 * Accumulated progress toward a "target by date" goal, by kind.
 * - expense: real funding set aside and not yet spent (`priorSaved + fundedThisPeriod - activity`).
 *   `activity` is spend, so a purchase draws the fund down.
 * - income: money that has actually arrived toward the goal (`priorSaved + activity`); `activity` is
 *   income received, and `fundedThisPeriod` is ignored - you don't hand-fund income you receive.
 */
export function targetSaved(kind: BudgetKind, opts: { activity: number, fundedThisPeriod: number, priorSaved: number }): number {
  return kind === 'income' ? opts.priorSaved + opts.activity : opts.priorSaved + opts.fundedThisPeriod - opts.activity
}

export type ReduceCandidate = { assigned: number, id: BudgetId }
export type ReduceCandidateInput = { assigned: number, hasAssignment: boolean, id: BudgetId, isTarget: boolean, kind: BudgetKind }
export type ReduceCut = { cut: number, id: BudgetId }

/**
 * How much of a budget's assignment feeds the to-assign pool. A sinking-fund target counts only
 * when it carries a real funding override (hasAssignment) - its synthetic set-aside never entered
 * the pool. For a funded target `assigned` (the effective assignment in base) IS its explicit
 * funding, since the override wins in rawAssigned. Shared by toAssignTotal and the ReduceAssign
 * sheet so the two cannot drift apart.
 */
export function assignedPoolContribution(opts: { assigned: number, hasAssignment: boolean, isTarget: boolean }): number {
  return opts.isTarget && !opts.hasAssignment ? 0 : opts.assigned
}

/** Expense budgets whose assignment actually feeds the pool, most-assigned first (base currency). */
export function reduceCandidates(inputs: ReduceCandidateInput[]): ReduceCandidate[] {
  const out: ReduceCandidate[] = []
  for (const b of inputs) {
    if (b.kind !== 'expense')
      continue
    const contributing = assignedPoolContribution(b)
    if (contributing > 0)
      out.push({ assigned: contributing, id: b.id })
  }
  return out.sort((a, b) => b.assigned - a.assigned)
}

/**
 * Greedy trim: cut the largest assignments in turn until `overBase` is balanced or candidates run
 * out. A remainder at or under 0.005 (half a minor currency unit of float residue) counts as
 * balanced. All amounts in base currency.
 */
export function greedyReduceCuts(overBase: number, candidates: ReduceCandidate[]): ReduceCut[] {
  const cuts: ReduceCut[] = []
  let remaining = overBase
  for (const c of candidates) {
    if (remaining <= 0.005)
      break
    const cut = Math.min(remaining, c.assigned)
    cuts.push({ cut, id: c.id })
    remaining -= cut
  }
  return cuts
}

/**
 * New raw assignment (budget's OWN currency) after pulling `deltaOwn` back to the pool, floored at
 * 0. Deliberately NOT capped at available: already-spent money still frees its assignment, possibly
 * sending available negative - reduce returns money to the pool, it does not conserve like
 * movableAmount.
 */
export function reducedAssignment(currentRaw: number, deltaOwn: number): number {
  return Math.max(0, currentRaw - deltaOwn)
}
