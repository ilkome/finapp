import type { BudgetId, BudgetItem } from '~/components/budgets/types'
import type { BudgetPeriodProvider } from '~/components/budgets/useBudgetPeriod'
import type { CategoryId } from '~/components/categories/types'
import type { Range } from '~/components/date/types'

import { getAmountInRate, getTotal } from '~/components/amount/getTotal'
import { budgetOwnedCategoryIds, carriedIn, computeAvailable, normalizeAmount, paceMarker, projectedPeriodEnd, safeToSpend } from '~/components/budgets/compute'
import { useBudgetsStore } from '~/components/budgets/useBudgetsStore'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { occurrencesInRange, occurrenceTrnId } from '~/components/recurrences/occurrences'
import { useRecurrencesStore } from '~/components/recurrences/useRecurrencesStore'
import { TrnType } from '~/components/trns/types'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

export type BudgetProgress = {
  activity: number
  assigned: number
  available: number
  carried: number
  committed: number
  isOver: boolean
  pace: number
  projected: number
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

  // Spend (or income) booked to the budget's owned categories within `range`, in base currency.
  function activityInRange(budget: BudgetItem, owned: Set<CategoryId>, range: Range): number {
    const inRange = trnsStore.getStoreTrnsIds({ dates: range })
    const ids = inRange.filter(id => owned.has(trnsStore.items?.[id]?.categoryId as CategoryId))
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
  function effectiveAssigned(budgetId: BudgetId, budget: BudgetItem, periodStart: number): number {
    const raw = budgetsStore.assignmentFor(budgetId, periodStart)
      ?? normalizeAmount(budget.amount, budget.amountPeriod, period.periodType.value)
    return getAmountInRate({
      amount: raw,
      baseCurrencyCode: currenciesStore.base,
      currencyCode: budget.currency || currenciesStore.base,
      rates: currenciesStore.rates,
    })
  }

  // Committed recurring spend in the period not yet realized (no matching trn). Safe-to-spend
  // subtracts it so discretionary money excludes known upcoming bills.
  function committedRemaining(budget: BudgetItem, owned: Set<CategoryId>, range: Range): number {
    const wantType = budget.kind === 'income' ? TrnType.Income : TrnType.Expense
    const base = currenciesStore.base
    const rates = currenciesStore.rates
    let sum = 0
    for (const [ruleId, rule] of Object.entries(recurrencesStore.activeItems)) {
      if (rule.type !== wantType || !owned.has(rule.categoryId))
        continue
      for (const day of occurrencesInRange(rule, range)) {
        if (trnsStore.items?.[occurrenceTrnId(ruleId, day)])
          continue
        const currency = walletsStore.items?.[rule.walletId]?.currency ?? base
        sum += getAmountInRate({ amount: rule.amount, baseCurrencyCode: base, currencyCode: currency, rates })
      }
    }
    return sum
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

  function progressFor(budgetId: BudgetId): BudgetProgress | undefined {
    const budget = budgetsStore.items?.[budgetId]
    if (!budget)
      return undefined

    const owned = ownedSet(budget)
    const range = period.range.value

    const assigned = effectiveAssigned(budgetId, budget, range.start)
    const activity = activityInRange(budget, owned, range)
    const carried = carriedIn({
      activityForPeriod: ps => activityInRange(budget, owned, period.rangeForStart(ps)),
      assignedForPeriod: ps => effectiveAssigned(budgetId, budget, ps),
      periodStarts: rolloverStarts(budgetId, budget, owned),
      rollover: budget.rollover,
    })
    const available = computeAvailable(carried, assigned, activity)

    return {
      activity,
      assigned,
      available,
      carried,
      committed: committedRemaining(budget, owned, range),
      isOver: available < 0,
      pace: paceMarker(assigned, period.daysElapsed.value, period.daysInPeriod.value),
      projected: projectedPeriodEnd(activity, period.daysElapsed.value, period.daysInPeriod.value),
    }
  }

  // Page hero (limits mode): discretionary money left after committed recurring spend.
  const safeToSpendTotal = computed(() => {
    let expenseAvailable = 0
    let committed = 0
    for (const id of Object.keys(budgetsStore.activeItems)) {
      const budget = budgetsStore.activeItems[id]!
      if (budget.kind !== 'expense')
        continue
      const p = progressFor(id)
      if (!p)
        continue
      expenseAvailable += p.available
      committed += p.committed
    }
    return safeToSpend(expenseAvailable, committed)
  })

  return {
    progressFor,
    safeToSpendTotal,
  }
}
