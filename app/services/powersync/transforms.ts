import type { BudgetAssignmentItem, BudgetBucket, BudgetItem, BudgetKind, BudgetPeriodType, BudgetRollover, BudgetStatus } from '~/components/budgets/types'
import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { Rates } from '~/components/currencies/types'
import type { RecurrenceEndMode, RecurrenceFreq, RecurrenceItem, RecurrenceStatus } from '~/components/recurrences/types'
import type { TrnItem } from '~/components/trns/types'
import type { WalletItem, WalletType } from '~/components/wallets/types'

import { TrnType } from '~/components/trns/types'

// Raw SQLite row: every synced table includes an `id` text primary key.
export type Row = Record<string, any> & { id: string }

// null updatedAt -> 0 (epoch), never Date.now(): stable across reads so reconcile change-detection works.
const ts = (v: unknown): number => (v == null ? 0 : Number(v))

// --- read: SQLite row -> Pinia item shape -------------------------------------

export function rowToTrn(row: Row): TrnItem {
  const type = Number(row.type) as TrnType
  const base = {
    date: Number(row.date),
    updatedAt: ts(row.updatedAt),
    ...(row.desc ? { desc: row.desc as string } : {}),
    ...(row.enteredAt != null ? { enteredAt: Number(row.enteredAt) } : {}),
    ...(row.recurrenceId ? { recurrenceId: row.recurrenceId as string } : {}),
  }

  if (type === TrnType.Transfer) {
    return {
      ...base,
      categoryId: 'transfer',
      expenseAmount: Number(row.expenseAmount),
      expenseWalletId: row.expenseWalletId,
      incomeAmount: Number(row.incomeAmount),
      incomeWalletId: row.incomeWalletId,
      type,
    } as TrnItem
  }

  return {
    ...base,
    amount: Number(row.amount),
    categoryId: row.categoryId,
    type,
    walletId: row.walletId,
  } as TrnItem
}

export function rowToWallet(row: Row): WalletItem {
  const base = {
    color: row.color,
    currency: row.currency,
    desc: (row.desc ?? '') as string,
    isArchived: !!row.isArchived,
    isExcludeInTotal: !!row.isExcludeInTotal,
    isWithdrawal: !!row.isWithdrawal,
    name: row.name,
    order: Number(row.order ?? 0),
    updatedAt: ts(row.updatedAt),
  }

  if (row.type === 'credit')
    return { ...base, creditLimit: Number(row.creditLimit ?? 0), type: 'credit' }

  return { ...base, type: row.type as Exclude<WalletType, 'credit'> }
}

export function rowToCategory(row: Row): CategoryItem {
  return {
    color: row.color,
    icon: row.icon,
    name: row.name,
    parentId: (row.parentId ?? 0) as CategoryId | 0, // null -> 0 (root sentinel)
    showInLastUsed: !!row.showInLastUsed,
    showInQuickSelector: !!row.showInQuickSelector,
    ...(row.updatedAt != null ? { updatedAt: Number(row.updatedAt) } : {}),
  }
}

export function rowToRates(row: Row): Rates | null {
  if (!row?.rates)
    return null
  try {
    return JSON.parse(row.rates as string) as Rates
  }
  catch {
    return null
  }
}

// --- write: Pinia item shape -> SQLite row ------------------------------------
// Booleans -> 0/1, root parentId sentinel (0) -> null, userId stamped for RLS on upload.

export function trnToRow(item: TrnItem, userId: string): Record<string, unknown> {
  const base = {
    amount: null as number | null,
    categoryId: item.categoryId ?? null,
    date: item.date,
    desc: item.desc ?? null,
    enteredAt: item.enteredAt ?? null,
    expenseAmount: null as number | null,
    expenseWalletId: null as string | null,
    incomeAmount: null as number | null,
    incomeWalletId: null as string | null,
    recurrenceId: item.recurrenceId ?? null,
    type: item.type,
    updatedAt: item.updatedAt ?? Date.now(),
    userId,
    walletId: null as string | null,
  }

  if (item.type === TrnType.Transfer) {
    return {
      ...base,
      categoryId: 'transfer',
      expenseAmount: item.expenseAmount,
      expenseWalletId: item.expenseWalletId,
      incomeAmount: item.incomeAmount,
      incomeWalletId: item.incomeWalletId,
    }
  }

  return { ...base, amount: item.amount, walletId: item.walletId }
}

export function walletToRow(item: WalletItem, userId: string): Record<string, unknown> {
  return {
    color: item.color,
    creditLimit: item.type === 'credit' ? (item.creditLimit ?? 0) : null,
    currency: item.currency,
    desc: item.desc || null,
    isArchived: item.isArchived ? 1 : 0,
    isExcludeInTotal: item.isExcludeInTotal ? 1 : 0,
    isWithdrawal: item.isWithdrawal ? 1 : 0,
    name: item.name,
    order: Math.round(item.order ?? 0), // integer column - round, don't silently truncate
    type: item.type,
    updatedAt: item.updatedAt ?? Date.now(),
    userId,
  }
}

export function categoryToRow(item: CategoryItem, userId: string): Record<string, unknown> {
  return {
    color: item.color,
    icon: item.icon,
    name: item.name,
    parentId: item.parentId ? String(item.parentId) : null, // 0/'' root sentinel -> null
    showInLastUsed: item.showInLastUsed ? 1 : 0,
    showInQuickSelector: item.showInQuickSelector ? 1 : 0,
    updatedAt: item.updatedAt ?? Date.now(),
    userId,
  }
}

export function rowToRecurrence(row: Row): RecurrenceItem {
  let skipDates: string[] = []
  if (row.skipDates) {
    try {
      const parsed = JSON.parse(row.skipDates as string)
      if (Array.isArray(parsed))
        skipDates = parsed as string[]
    }
    catch { /* keep [] */ }
  }

  let amountHistory: RecurrenceItem['amountHistory']
  if (row.amountHistory) {
    try {
      const parsed = JSON.parse(row.amountHistory as string)
      if (Array.isArray(parsed) && parsed.length)
        amountHistory = parsed as RecurrenceItem['amountHistory']
    }
    catch { /* leave undefined */ }
  }

  return {
    amount: Number(row.amount),
    ...(amountHistory ? { amountHistory } : {}),
    anchorDate: Number(row.anchorDate),
    autoCreate: !!row.autoCreate,
    categoryId: row.categoryId,
    ...(row.desc ? { desc: row.desc as string } : {}),
    ...(row.endCount != null ? { endCount: Number(row.endCount) } : {}),
    ...(row.endDate != null ? { endDate: Number(row.endDate) } : {}),
    endMode: (row.endMode ?? 'never') as RecurrenceEndMode,
    freq: row.freq as RecurrenceFreq,
    interval: Number(row.interval ?? 1),
    ...(row.lastGeneratedDate != null ? { lastGeneratedDate: Number(row.lastGeneratedDate) } : {}),
    monthLastDay: !!row.monthLastDay,
    skipDates,
    status: (row.status ?? 'active') as RecurrenceStatus,
    type: Number(row.type) as RecurrenceItem['type'],
    updatedAt: ts(row.updatedAt),
    walletId: row.walletId,
  }
}

export function recurrenceToRow(item: RecurrenceItem, userId: string): Record<string, unknown> {
  return {
    amount: item.amount,
    amountHistory: JSON.stringify(item.amountHistory ?? []),
    anchorDate: item.anchorDate,
    autoCreate: item.autoCreate ? 1 : 0,
    categoryId: item.categoryId,
    desc: item.desc ?? null,
    endCount: item.endCount ?? null,
    endDate: item.endDate ?? null,
    endMode: item.endMode,
    freq: item.freq,
    interval: item.interval,
    lastGeneratedDate: item.lastGeneratedDate ?? null,
    monthLastDay: item.monthLastDay ? 1 : 0,
    skipDates: JSON.stringify(item.skipDates ?? []),
    status: item.status,
    type: item.type,
    updatedAt: item.updatedAt ?? Date.now(),
    userId,
    walletId: item.walletId,
  }
}

export function rowToBudget(row: Row): BudgetItem {
  return {
    amount: Number(row.amount),
    amountPeriod: (row.amountPeriod ?? 'month') as BudgetPeriodType,
    ...(row.bucket ? { bucket: row.bucket as BudgetBucket } : {}),
    categoryId: row.categoryId,
    currency: (row.currency ?? '') as string, // empty on legacy rows -> read path treats it as base
    ...(row.goalAmount != null ? { goalAmount: Number(row.goalAmount) } : {}),
    ...(row.goalDate != null ? { goalDate: Number(row.goalDate) } : {}),
    kind: (row.kind ?? 'expense') as BudgetKind,
    rollover: (row.rollover ?? 'none') as BudgetRollover,
    status: (row.status ?? 'active') as BudgetStatus,
    updatedAt: ts(row.updatedAt),
  }
}

export function budgetToRow(item: BudgetItem, userId: string): Record<string, unknown> {
  return {
    amount: item.amount,
    amountPeriod: item.amountPeriod,
    bucket: item.bucket ?? null,
    categoryId: item.categoryId,
    currency: item.currency,
    goalAmount: item.goalAmount ?? null,
    goalDate: item.goalDate ?? null,
    kind: item.kind,
    rollover: item.rollover,
    status: item.status,
    updatedAt: item.updatedAt ?? Date.now(),
    userId,
  }
}

export function rowToBudgetAssignment(row: Row): BudgetAssignmentItem {
  return {
    assigned: Number(row.assigned),
    budgetId: row.budgetId,
    periodStart: Number(row.periodStart),
    updatedAt: ts(row.updatedAt),
  }
}

export function budgetAssignmentToRow(item: BudgetAssignmentItem, userId: string): Record<string, unknown> {
  return {
    assigned: item.assigned,
    budgetId: item.budgetId,
    periodStart: item.periodStart,
    updatedAt: item.updatedAt ?? Date.now(),
    userId,
  }
}
