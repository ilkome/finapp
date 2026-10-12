import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { Rates } from '~/components/currencies/types'
import type { LoanItem, LoanScheduleRowItem } from '~/components/loans/types'
import type { TrnItem } from '~/components/trns/types'
import type { WalletItem, WalletType } from '~/components/wallets/types'

import { loanItemSchema, loanScheduleRowSchema } from '~/components/loans/types'
import { TrnType } from '~/components/trns/types'
import { createLogger } from '~/utils/logger'

// Raw SQLite row: every synced table includes an `id` text primary key.
export type Row = Record<string, any> & { id: string }

// null updatedAt -> 0 (epoch), never Date.now(): stable across reads so reconcile change-detection works.
const logger = createLogger('transforms')

const ts = (v: unknown): number => (v == null ? 0 : Number(v))

// --- read: SQLite row -> Pinia item shape -------------------------------------

export function rowToTrn(row: Row): TrnItem {
  const type = Number(row.type) as TrnType
  const base = {
    date: Number(row.date),
    updatedAt: ts(row.updatedAt),
    ...(row.desc ? { desc: row.desc as string } : {}),
    ...(row.enteredAt != null ? { enteredAt: Number(row.enteredAt) } : {}),
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

  if (row.type === 'credit') {
    return {
      ...base,
      creditLimit: Number(row.creditLimit ?? 0),
      type: 'credit',
      ...(row.minPaymentAmount != null ? { minPaymentAmount: Number(row.minPaymentAmount) } : {}),
      ...(row.minPaymentDate != null ? { minPaymentDate: Number(row.minPaymentDate) } : {}),
      ...(row.minPaymentUpdatedAt != null ? { minPaymentUpdatedAt: Number(row.minPaymentUpdatedAt) } : {}),
    }
  }

  return { ...base, type: row.type as Exclude<WalletType, 'credit'> }
}

export function rowToCategory(row: Row): CategoryItem {
  return {
    color: row.color,
    icon: row.icon,
    isExcludeFromStats: !!row.isExcludeFromStats,
    name: row.name,
    parentId: (row.parentId ?? 0) as CategoryId | 0, // null -> 0 (root sentinel)
    showInLastUsed: !!row.showInLastUsed,
    showInQuickSelector: !!row.showInQuickSelector,
    ...(row.updatedAt != null ? { updatedAt: Number(row.updatedAt) } : {}),
  }
}

// SQLite returns null for every unset column, including columns added after the row was
// written: drop them so the schema defaults and optional fields apply.
function definedColumns(row: Row): Record<string, unknown> {
  return Object.fromEntries(Object.entries(row).filter(([, value]) => value != null))
}

/** Null for a row the schema rejects: one bad synced row must not stop every other loan. */
export function rowToLoan(row: Row): LoanItem | null {
  // null is a real value here (no published rate); updatedAt reads null as 0, stable across emits.
  const parsed = loanItemSchema.safeParse({ ...definedColumns(row), annualRate: row.annualRate ?? null, updatedAt: ts(row.updatedAt) })
  if (!parsed.success)
    logger.error('skipped invalid loan row', row.id, parsed.error.issues)
  return parsed.success ? parsed.data : null
}

export function rowToLoanScheduleRow(row: Row): LoanScheduleRowItem | null {
  const parsed = loanScheduleRowSchema.safeParse({ ...definedColumns(row), updatedAt: ts(row.updatedAt) })
  if (!parsed.success)
    logger.error('skipped invalid schedule row', row.id, parsed.error.issues)
  return parsed.success ? parsed.data : null
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

  return {
    ...base,
    amount: item.amount,
    walletId: item.walletId,
  }
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
    minPaymentAmount: item.type === 'credit' ? (item.minPaymentAmount ?? null) : null,
    minPaymentDate: item.type === 'credit' ? (item.minPaymentDate ?? null) : null,
    minPaymentUpdatedAt: item.type === 'credit' ? (item.minPaymentUpdatedAt ?? null) : null,
    name: item.name,
    order: Math.round(item.order ?? 0), // integer column - round, don't silently truncate
    type: item.type,
    updatedAt: item.updatedAt ?? Date.now(),
    userId,
  }
}

export function loanToRow(item: LoanItem, userId: string): Record<string, unknown> {
  return {
    annualRate: item.annualRate,
    // Bank figures pass through untouched, so editing the loan never wipes what bank sync pushed.
    bankDebtAmount: item.bankDebtAmount ?? null,
    bankDebtUpdatedAt: item.bankDebtUpdatedAt ?? null,
    closedDate: item.closedDate ?? null,
    contractNumber: item.contractNumber || null,
    debitWalletId: item.debitWalletId ?? null,
    desc: item.desc || null,
    firstPaymentDate: item.firstPaymentDate,
    interestMethod: item.interestMethod,
    lateAfterDays: item.lateAfterDays,
    nextPaymentDate: item.nextPaymentDate ?? null,
    nextPaymentInterest: item.nextPaymentInterest ?? null,
    nextPaymentPrincipal: item.nextPaymentPrincipal ?? null,
    overpaymentMode: item.overpaymentMode,
    paymentDay: item.paymentDay,
    prepayWindowDays: item.prepayWindowDays,
    principalAmount: item.principalAmount,
    scheduleType: item.scheduleType,
    startDate: item.startDate,
    termMonths: item.termMonths,
    updatedAt: item.updatedAt ?? Date.now(),
    userId,
    walletId: item.walletId,
  }
}

export function loanScheduleRowToRow(item: LoanScheduleRowItem, userId: string): Record<string, unknown> {
  return {
    date: item.date,
    interestPart: item.interestPart,
    loanId: item.loanId,
    paymentNumber: item.paymentNumber,
    principalPart: item.principalPart,
    source: item.source,
    totalAmount: item.totalAmount,
    updatedAt: item.updatedAt ?? Date.now(),
    userId,
  }
}

export function categoryToRow(item: CategoryItem, userId: string): Record<string, unknown> {
  return {
    color: item.color,
    icon: item.icon,
    isExcludeFromStats: item.isExcludeFromStats ? 1 : 0,
    name: item.name,
    parentId: item.parentId ? String(item.parentId) : null, // 0/'' root sentinel -> null
    showInLastUsed: item.showInLastUsed ? 1 : 0,
    showInQuickSelector: item.showInQuickSelector ? 1 : 0,
    updatedAt: item.updatedAt ?? Date.now(),
    userId,
  }
}
