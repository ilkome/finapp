import type { CategoryId, CategoryItem } from '~/components/categories/types'
import type { Rates } from '~/components/currencies/types'
import type { LoanItem, LoanScheduleRowItem } from '~/components/loans/types'
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

export function rowToLoan(row: Row): LoanItem {
  return {
    annualRate: row.annualRate == null ? null : Number(row.annualRate),
    contractNumber: (row.contractNumber ?? '') as string,
    desc: (row.desc ?? '') as string,
    firstPaymentDate: Number(row.firstPaymentDate),
    // Rows written before these columns existed carry nulls: the contract defaults stand in.
    interestMethod: row.interestMethod === 'daily' ? 'daily' : 'monthly',
    lateAfterDays: row.lateAfterDays == null ? 3 : Number(row.lateAfterDays),
    overpaymentMode: row.overpaymentMode as LoanItem['overpaymentMode'],
    paymentDay: Number(row.paymentDay),
    prepayWindowDays: row.prepayWindowDays == null ? 15 : Number(row.prepayWindowDays),
    principalAmount: Number(row.principalAmount ?? 0),
    scheduleType: row.scheduleType as LoanItem['scheduleType'],
    startDate: Number(row.startDate),
    termMonths: Number(row.termMonths),
    updatedAt: ts(row.updatedAt),
    walletId: row.walletId,
    ...(row.debitWalletId ? { debitWalletId: row.debitWalletId as string } : {}),
    ...(row.bankDebtAmount != null ? { bankDebtAmount: Number(row.bankDebtAmount) } : {}),
    ...(row.bankDebtUpdatedAt != null ? { bankDebtUpdatedAt: Number(row.bankDebtUpdatedAt) } : {}),
    ...(row.nextPaymentDate != null ? { nextPaymentDate: Number(row.nextPaymentDate) } : {}),
    ...(row.nextPaymentInterest != null ? { nextPaymentInterest: Number(row.nextPaymentInterest) } : {}),
    ...(row.nextPaymentPrincipal != null ? { nextPaymentPrincipal: Number(row.nextPaymentPrincipal) } : {}),
  }
}

export function rowToLoanScheduleRow(row: Row): LoanScheduleRowItem {
  return {
    date: Number(row.date),
    interestPart: Number(row.interestPart ?? 0),
    loanId: row.loanId,
    paymentNumber: Number(row.paymentNumber),
    principalPart: Number(row.principalPart ?? 0),
    source: row.source as LoanScheduleRowItem['source'],
    totalAmount: Number(row.totalAmount ?? 0),
    updatedAt: ts(row.updatedAt),
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
    contractNumber: item.contractNumber || null,
    debitWalletId: item.debitWalletId ?? null,
    desc: item.desc || null,
    firstPaymentDate: item.firstPaymentDate,
    interestMethod: item.interestMethod,
    lateAfterDays: Math.round(item.lateAfterDays),
    nextPaymentDate: item.nextPaymentDate ?? null,
    nextPaymentInterest: item.nextPaymentInterest ?? null,
    nextPaymentPrincipal: item.nextPaymentPrincipal ?? null,
    overpaymentMode: item.overpaymentMode,
    paymentDay: Math.round(item.paymentDay),
    prepayWindowDays: Math.round(item.prepayWindowDays),
    principalAmount: item.principalAmount,
    scheduleType: item.scheduleType,
    startDate: item.startDate,
    termMonths: Math.round(item.termMonths),
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
    paymentNumber: Math.round(item.paymentNumber),
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
