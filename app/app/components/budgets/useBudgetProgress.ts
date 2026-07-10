import type { BudgetId, BudgetItem } from '~/components/budgets/types'
import type { BudgetPeriodProvider } from '~/components/budgets/useBudgetPeriod'
import type { CategoryId } from '~/components/categories/types'
import type { Range } from '~/components/date/types'
import type { OccurrenceMatchTrn } from '~/components/recurrences/occurrences'
import type { RecurrenceId, RecurrenceItem } from '~/components/recurrences/types'
import type { TrnId } from '~/components/trns/types'

import { getAmountInRate, getTotal } from '~/components/amount/getTotal'
import { budgetOwnedCategoryIds, carriedIn, computeAvailable, isGoalReached, isOverBudget, movableAmount, normalizeAmount, paceMarker, periodsUntilGoal, projectedPeriodEnd, safeToSpend, targetSetAside, toAssignPool } from '~/components/budgets/compute'
import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { unrealizedOccurrenceDays } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

// Sinking-fund overlay (set when the budget has goalAmount + goalDate). All amounts in base currency.
export type BudgetTarget = {
  goalAmount: number
  goalDate: number
  // 0..1 progress of accumulated set-aside (the budget's available) toward the goal.
  pct: number
  // Whole periods left until the goal date (>= 1).
  periodsLeft: number
  // True once the accumulated set-aside meets or beats the goal amount.
  reached: boolean
  // Accumulated set-aside not yet spent (the budget's available); what's "saved" toward the goal.
  saved: number
}

export type BudgetProgress = {
  activity: number
  assigned: number
  // The assigned limit in the budget's OWN currency (what the per-period override input edits),
  // before conversion to base. `assigned` is the base-currency value used for the math/display.
  assignedRaw: number
  available: number
  carried: number
  committed: number
  // True when an explicit per-period assignment overrides the normalized default for the viewed period.
  hasAssignment: boolean
  isGoalReached: boolean
  isOver: boolean
  pace: number
  projected: number
  // Present for "target by date" (sinking-fund) budgets; null for plain limits.
  target: BudgetTarget | null
}

/** A budget is a sinking-fund "target by date" when it carries both a goal amount and a goal date. */
function isTargetBudget(budget: BudgetItem): boolean {
  return budget.goalAmount != null && budget.goalAmount > 0 && budget.goalDate != null
}

/**
 * Per-budget triad (assigned / spent / available) + pace + projection over the viewed period, plus
 * the page-level safe-to-spend. Activity aggregates the budget's owned category subtree (excluding
 * self-budgeted descendants), converted to base currency. See plans/budgets.md §5, §9, §10.
 */
export function useBudgetProgress(period: BudgetPeriodProvider) {
  const trnsStore = useTrnsStore()
  const walletsStore = useWalletsStore()
  const currenciesStore = useCurrenciesStore()
  const categoriesStore = useCategoriesStore()
  const budgetsStore = useBudgetsStore()
  const recurrencesStore = useRecurrencesStore()

  const budgetedCategoryIds = computed(() =>
    new Set(Object.values(budgetsStore.activeItems).map(b => b.categoryId)),
  )

  function ownedSet(budget: BudgetItem): Set<CategoryId> {
    return new Set(budgetOwnedCategoryIds(categoriesStore.items ?? {}, budget.categoryId, budgetedCategoryIds.value))
  }

  // Trn ids booked to the budget's owned categories within `range` (drill-through / activity).
  function activityIdsInRange(owned: Set<CategoryId>, range: Range): TrnId[] {
    return trnsStore.getStoreTrnsIds({ dates: range })
      .filter(id => owned.has(trnsStore.items?.[id]?.categoryId as CategoryId))
  }

  // The current period's transactions behind a budget's "Spent" figure (for the drill-through sheet).
  function trnsIdsFor(budgetId: BudgetId): TrnId[] {
    const budget = budgetsStore.items?.[budgetId]
    if (!budget)
      return []
    return activityIdsInRange(ownedSet(budget), period.range.value)
  }

  // Spend (or income) booked to the budget's owned categories within `range`, in base currency.
  function activityInRange(budget: BudgetItem, owned: Set<CategoryId>, range: Range): number {
    const ids = activityIdsInRange(owned, range)
    const total = getTotal({
      baseCurrencyCode: currenciesStore.base,
      rates: currenciesStore.rates,
      trnsIds: ids,
      trnsItems: trnsStore.items ?? {},
      walletsItems: walletsStore.items ?? {},
    })
    return budget.kind === 'income' ? total.income : total.expense
  }

  // Returns the assigned limit IN BASE CURRENCY so the rest of the math (activity, carry) stays in
  // one currency. An explicit per-period assignment is already in the viewed period's terms; the
  // base amount is normalized from the budget's cadence to the viewed timeframe. Both are stated in
  // the budget's own currency (empty on legacy rows -> already base) and converted via rates, so
  // changing the base currency keeps budgets correct.
  // Raw assigned in the budget's own currency: explicit override > target set-aside > normalized amount.
  function rawAssigned(budgetId: BudgetId, budget: BudgetItem, periodStart: number): number {
    const override = budgetsStore.assignmentFor(budgetId, periodStart)
    if (override !== undefined)
      return override
    if (isTargetBudget(budget))
      return targetSetAside(budget.goalAmount!, periodStart, budget.goalDate!, period.periodType.value)
    return normalizeAmount(budget.amount, budget.amountPeriod, period.periodType.value)
  }

  function effectiveAssigned(budgetId: BudgetId, budget: BudgetItem, periodStart: number): number {
    return getAmountInRate({
      amount: rawAssigned(budgetId, budget, periodStart),
      baseCurrencyCode: currenciesStore.base,
      currencyCode: budget.currency || currenciesStore.base,
      rates: currenciesStore.rates,
    })
  }

  // Only the explicit per-period override, in base currency, or 0 when none. A sinking-fund target
  // accumulates real funding via this - never the synthetic catch-up set-aside (which grows toward
  // the goal date), so prior spending history can't inflate "saved". See review MEDIUM-2.
  function explicitAssignedBase(budgetId: BudgetId, budget: BudgetItem, periodStart: number): number {
    const override = budgetsStore.assignmentFor(budgetId, periodStart)
    if (override === undefined)
      return 0
    return getAmountInRate({
      amount: override,
      baseCurrencyCode: currenciesStore.base,
      currencyCode: budget.currency || currenciesStore.base,
      rates: currenciesStore.rates,
    })
  }

  // Shared committed-cost core: sums each rule's still-unrealized occurrences in `range`, counting a
  // hand-entered or linked instance of a bill as realized (via unrealizedOccurrenceDays) so a paid
  // bill is never double-subtracted from safe-to-spend. `consumed` is shared across all rules so one
  // trn realizes at most one occurrence. Candidates are indexed by category from the in-range trns.
  function committedForRules(entries: [RecurrenceId, RecurrenceItem][], range: Range): number {
    const base = currenciesStore.base
    const rates = currenciesStore.rates
    const byCategory = new Map<CategoryId, OccurrenceMatchTrn[]>()
    for (const id of trnsStore.getStoreTrnsIds({ dates: range })) {
      const t = trnsStore.items?.[id]
      if (!t || t.type === TrnType.Transfer)
        continue
      const list = byCategory.get(t.categoryId) ?? []
      list.push({ amount: t.amount, date: t.date, id, recurrenceId: t.recurrenceId, type: t.type })
      byCategory.set(t.categoryId, list)
    }
    const consumed = new Set<TrnId>()
    let sum = 0
    for (const [ruleId, rule] of entries) {
      const candidates = byCategory.get(rule.categoryId) ?? []
      for (const _day of unrealizedOccurrenceDays(rule, ruleId, range, trnsStore.items ?? {}, candidates, consumed)) {
        const currency = walletsStore.items?.[rule.walletId]?.currency ?? base
        sum += getAmountInRate({ amount: rule.amount, baseCurrencyCode: base, currencyCode: currency, rates })
      }
    }
    return sum
  }

  // Committed recurring spend in the period not yet realized (no matching trn). Safe-to-spend
  // subtracts it so discretionary money excludes known upcoming bills.
  function committedRemaining(budget: BudgetItem, owned: Set<CategoryId>, range: Range): number {
    const wantType = budget.kind === 'income' ? TrnType.Income : TrnType.Expense
    const entries = Object.entries(recurrencesStore.activeItems)
      .filter(([, rule]) => rule.type === wantType && owned.has(rule.categoryId))
    return committedForRules(entries, range)
  }

  // Rollover starts at the first prior period with activity or an explicit assignment, so a fresh
  // budget doesn't accumulate phantom surplus over empty leading periods.
  function rolloverStarts(budgetId: BudgetId, budget: BudgetItem, owned: Set<CategoryId>): number[] {
    if (budget.rollover === 'none')
      return []
    const priors = period.periodStartsBefore.value
    const firstActive = priors.findIndex(ps =>
      budgetsStore.assignmentFor(budgetId, ps) !== undefined
      || activityInRange(budget, owned, period.rangeForStart(ps)) > 0,
    )
    return firstActive === -1 ? [] : priors.slice(firstActive)
  }

  // Sinking-fund overlay: how much is accumulated toward the goal and how far the date is.
  function buildTarget(budget: BudgetItem, periodStart: number, available: number): BudgetTarget | null {
    if (!isTargetBudget(budget))
      return null
    const goalAmount = getAmountInRate({
      amount: budget.goalAmount!,
      baseCurrencyCode: currenciesStore.base,
      currencyCode: budget.currency || currenciesStore.base,
      rates: currenciesStore.rates,
    })
    const saved = Math.max(0, available)
    return {
      goalAmount,
      goalDate: budget.goalDate!,
      pct: goalAmount > 0 ? Math.max(0, Math.min(1, saved / goalAmount)) : 0,
      periodsLeft: periodsUntilGoal(periodStart, budget.goalDate!, period.periodType.value),
      reached: goalAmount > 0 && saved >= goalAmount,
      saved,
    }
  }

  function progressFor(budgetId: BudgetId): BudgetProgress | undefined {
    const budget = budgetsStore.items?.[budgetId]
    if (!budget)
      return undefined

    const owned = ownedSet(budget)
    const range = period.range.value

    const override = budgetsStore.assignmentFor(budgetId, range.start)
    const assignedRaw = rawAssigned(budgetId, budget, range.start)
    const assigned = effectiveAssigned(budgetId, budget, range.start)
    const activity = activityInRange(budget, owned, range)
    const isTarget = isTargetBudget(budget)
    const carried = carriedIn({
      activityForPeriod: ps => activityInRange(budget, owned, period.rangeForStart(ps)),
      // A target carries only real funding (explicit assignments); a plain budget carries its
      // effective assignment. See review MEDIUM-2.
      assignedForPeriod: ps => isTarget ? explicitAssignedBase(budgetId, budget, ps) : effectiveAssigned(budgetId, budget, ps),
      periodStarts: rolloverStarts(budgetId, budget, owned),
      rollover: budget.rollover,
    })
    const available = computeAvailable(carried, assigned, activity)
    // A target's "saved" is only REAL funding: accumulated explicit assignments (carried) plus this
    // period's explicit funding, minus spend - never the synthetic set-aside (which would show fake
    // progress and make the Fund button a no-op). See review MEDIUM-2 / finding 2.
    const targetSaved = carried + explicitAssignedBase(budgetId, budget, range.start) - activity

    return {
      activity,
      assigned,
      assignedRaw,
      available,
      carried,
      committed: committedRemaining(budget, owned, range),
      hasAssignment: override !== undefined,
      isGoalReached: isGoalReached(budget.kind, assigned, activity),
      isOver: isOverBudget(budget.kind, available),
      pace: paceMarker(assigned, period.daysElapsed.value, period.daysInPeriod.value),
      projected: projectedPeriodEnd(activity, period.daysElapsed.value, period.daysInPeriod.value),
      target: buildTarget(budget, range.start, isTarget ? targetSaved : available),
    }
  }

  // Committed recurring expense in categories that NO budget covers (so their upcoming bills still
  // reduce discretionary money). Union of all budgets' owned categories, then sweep the rest.
  function committedUnbudgeted(range: Range): number {
    const budgeted = new Set<CategoryId>()
    for (const id of Object.keys(budgetsStore.activeItems)) {
      for (const c of ownedSet(budgetsStore.activeItems[id]!))
        budgeted.add(c)
    }
    const entries = Object.entries(recurrencesStore.activeItems)
      .filter(([, rule]) => rule.type === TrnType.Expense && !budgeted.has(rule.categoryId))
    return committedForRules(entries, range)
  }

  // Page hero (limits mode): discretionary money left after ALL committed recurring spend - both
  // inside expense budgets and in categories with no budget at all.
  const safeToSpendTotal = computed(() => {
    let expenseAvailable = 0
    let committed = 0
    for (const id of Object.keys(budgetsStore.activeItems)) {
      const budget = budgetsStore.activeItems[id]!
      // Sinking-fund targets hold earmarked savings, not discretionary money. See review MEDIUM-3.
      if (budget.kind !== 'expense' || isTargetBudget(budget))
        continue
      const p = progressFor(id)
      if (!p)
        continue
      expenseAvailable += p.available
      committed += p.committed
    }
    return safeToSpend(expenseAvailable, committed + committedUnbudgeted(period.range.value))
  })

  // Income received this period across all categories, in base currency (drives the to-assign pool).
  const periodIncomeTotal = computed(() => {
    const inRange = trnsStore.getStoreTrnsIds({ dates: period.range.value })
    return getTotal({
      baseCurrencyCode: currenciesStore.base,
      rates: currenciesStore.rates,
      trnsIds: inRange,
      trnsItems: trnsStore.items ?? {},
      walletsItems: walletsStore.items ?? {},
    }).income
  })

  // To-assign pool (1.4): income received this period minus what every expense budget assigns. The
  // page only surfaces it when there's period income - without it the figure is just -assigned. (A4)
  const toAssignTotal = computed(() => {
    const start = period.range.value.start
    let assigned = 0
    for (const id of Object.keys(budgetsStore.activeItems)) {
      const budget = budgetsStore.activeItems[id]!
      // A target counts only its REAL funding (explicit assignments), matching how safe-to-spend and
      // the target overlay treat it - so an unfunded goal doesn't eat the to-assign pool. (review 4)
      if (budget.kind === 'expense')
        assigned += isTargetBudget(budget) ? explicitAssignedBase(id, budget, start) : effectiveAssigned(id, budget, start)
    }
    return toAssignPool(periodIncomeTotal.value, assigned)
  })

  // Move money between two budgets for the viewed period (2.2): one's assignment drops, the other's
  // rises by the same base amount, each converted to its own currency. Both get an explicit override.
  function moveMoney(fromId: BudgetId, toId: BudgetId, baseAmount: number) {
    const from = budgetsStore.items?.[fromId]
    const to = budgetsStore.items?.[toId]
    if (!from || !to || fromId === toId || !(baseAmount > 0))
      return
    const start = period.range.value.start
    const base = currenciesStore.base
    const rates = currenciesStore.rates
    const fromAssigned = rawAssigned(fromId, from, start)
    const fromDelta = getAmountInRate({ amount: baseAmount, baseCurrencyCode: from.currency || base, currencyCode: base, rates })
    // Conserve money: the source can give at most its current AVAILABLE balance (carried + assigned -
    // spent), never money already spent. Cap the move there, reduce the source assignment by what was
    // removed, and credit the destination only with that amount (base -> dest currency). MEDIUM-1.
    const availableOwn = getAmountInRate({ amount: progressFor(fromId)?.available ?? 0, baseCurrencyCode: from.currency || base, currencyCode: base, rates })
    const movedFromOwn = movableAmount(availableOwn, fromDelta)
    const movedBase = getAmountInRate({ amount: movedFromOwn, baseCurrencyCode: base, currencyCode: from.currency || base, rates })
    const toDelta = getAmountInRate({ amount: movedBase, baseCurrencyCode: to.currency || base, currencyCode: base, rates })
    budgetsStore.setAssignment(fromId, start, fromAssigned - movedFromOwn)
    budgetsStore.setAssignment(toId, start, rawAssigned(toId, to, start) + toDelta)
  }

  // Pull an over-assignment back down ("Fix this" on a negative to-assign pool): reduce one budget's
  // assignment by `baseAmount` (base currency), converted to the budget's own currency and floored at
  // 0. Mirrors moveMoney's source half with no destination - the freed money returns to the pool.
  function reduceAssignment(budgetId: BudgetId, baseAmount: number) {
    const budget = budgetsStore.items?.[budgetId]
    if (!budget || !(baseAmount > 0))
      return
    const start = period.range.value.start
    const base = currenciesStore.base
    const rates = currenciesStore.rates
    const raw = rawAssigned(budgetId, budget, start)
    const deltaOwn = getAmountInRate({ amount: baseAmount, baseCurrencyCode: budget.currency || base, currencyCode: base, rates })
    budgetsStore.setAssignment(budgetId, start, Math.max(0, raw - deltaOwn))
  }

  // Per-budget history (2.3): assigned vs actual for each prior period plus the current one,
  // oldest first. Recomputed on the fly (history is small) so it never goes stale offline.
  function historyFor(budgetId: BudgetId): { activity: number, assigned: number, periodStart: number }[] {
    const budget = budgetsStore.items?.[budgetId]
    if (!budget)
      return []
    const owned = ownedSet(budget)
    const starts = [...period.periodStartsBefore.value, period.range.value.start]
    return starts.map(ps => ({
      activity: activityInRange(budget, owned, period.rangeForStart(ps)),
      assigned: effectiveAssigned(budgetId, budget, ps),
      periodStart: ps,
    }))
  }

  // Auto-assign (2.1): copy the most recent prior period's assigned amounts onto the viewed period.
  // Non-destructive: only fills budgets that have no explicit override yet this period (so a manual
  // tweak just made is never clobbered), and skips sinking-fund targets (their set-aside must stay
  // synthetic, not be frozen into a hard override). See review 2.1.
  function copyLastPeriod() {
    const prev = period.periodStartsBefore.value.at(-1)
    if (prev == null)
      return
    const cur = period.range.value.start
    for (const id of Object.keys(budgetsStore.activeItems)) {
      const budget = budgetsStore.activeItems[id]!
      if (isTargetBudget(budget) || budgetsStore.assignmentFor(id, cur) !== undefined)
        continue
      budgetsStore.setAssignment(id, cur, rawAssigned(id, budget, prev))
    }
  }

  return {
    copyLastPeriod,
    historyFor,
    moveMoney,
    periodIncomeTotal,
    progressFor,
    reduceAssignment,
    safeToSpendTotal,
    toAssignTotal,
    trnsIdsFor,
  }
}
