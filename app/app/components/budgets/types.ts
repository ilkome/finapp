import { z } from 'zod/v4'

export type BudgetId = string
export type BudgetAssignmentId = string

export const budgetKinds = ['expense', 'income'] as const
export type BudgetKind = typeof budgetKinds[number]

export const budgetRollovers = ['none', 'surplus', 'surplus_deficit'] as const
export type BudgetRollover = typeof budgetRollovers[number]

export const budgetBuckets = ['need', 'want', 'savings'] as const
export type BudgetBucket = typeof budgetBuckets[number]

export const budgetStatuses = ['active', 'archived'] as const
export type BudgetStatus = typeof budgetStatuses[number]

// Global budgeting mode (single persisted setting). v1 ships `limits`; envelope / 50-30-20 are P4.
export const budgetModes = ['limits', 'envelope', 'fifty_thirty_twenty'] as const
export type BudgetMode = typeof budgetModes[number]

// The single global budget period type (v1, variant A). Per-category cadence is deferred.
export const budgetPeriodTypes = ['week', 'month', 'year'] as const
export type BudgetPeriodType = typeof budgetPeriodTypes[number]

// Per-category budget config. Amounts are stored in the user's base currency. id + userId live on
// the row, not the item shape (mirrors RecurrenceItem). See plans/budgets.md §4.
export const budgetItemSchema = z.object({
  amount: z.number(),
  bucket: z.enum(budgetBuckets).nullable().optional(),
  categoryId: z.string().min(1),
  goalAmount: z.number().nullable().optional(),
  goalDate: z.number().nullable().optional(),
  kind: z.enum(budgetKinds),
  rollover: z.enum(budgetRollovers),
  status: z.enum(budgetStatuses),
  updatedAt: z.number(),
})
export type BudgetItem = z.infer<typeof budgetItemSchema>
export type Budgets = Record<BudgetId, BudgetItem>

// Per-period assigned override (envelope mode, auto-budget, manual tweak). When absent for a
// period, budgets.amount applies. See plans/budgets.md §4.
export const budgetAssignmentItemSchema = z.object({
  assigned: z.number(),
  budgetId: z.string().min(1),
  periodStart: z.number(),
  updatedAt: z.number(),
})
export type BudgetAssignmentItem = z.infer<typeof budgetAssignmentItemSchema>
export type BudgetAssignments = Record<BudgetAssignmentId, BudgetAssignmentItem>
