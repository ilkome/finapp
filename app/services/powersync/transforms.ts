import type { z } from 'zod/v4'

import type { BankReport } from '~/components/bankReports/types'
import type { CategoryItem } from '~/components/categories/types'
import type { Rates } from '~/components/currencies/types'
import type { LoanItem, LoanScheduleOverrideItem } from '~/components/loans/types'
import type { TrnItem } from '~/components/trns/types'
import type { WalletItem } from '~/components/wallets/types'

import { bankReportSchema } from '~/components/bankReports/types'
import { categoryFormSchema } from '~/components/categories/types'
import { loanItemSchema, loanScheduleOverrideSchema } from '~/components/loans/types'
import { trnItemSchema } from '~/components/trns/types'
import { walletItemSchema } from '~/components/wallets/types'
import { createLogger } from '~/utils/logger'

import type { SyncedTableName } from './columns'

import { itemToRow, rowToItem } from './columns'

// Raw SQLite row: every synced table includes an `id` text primary key.
export type Row = Record<string, any> & { id: string }

const logger = createLogger('transforms')

/** Null for a row the schema rejects: one bad synced row must not stop every other row of its table. */
function parse<T>(table: SyncedTableName, schema: z.ZodType<T>, row: Row, extra: Record<string, unknown> = {}): T | null {
  const parsed = schema.safeParse({ ...rowToItem(table, row), ...extra })
  if (!parsed.success)
    logger.error(`skipped invalid ${table} row`, row.id, parsed.error.issues)
  return parsed.success ? parsed.data : null
}

/** Item -> row with the owner stamped for RLS; `created_at` is `not null`, so a missing one is now. */
function toRow(table: SyncedTableName, item: object, userId: string): Record<string, unknown> {
  const { createdAt, updatedAt } = item as { createdAt?: number, updatedAt?: number }
  const now = Date.now()
  return itemToRow(table, { ...item, createdAt: createdAt ?? now, updatedAt: updatedAt ?? now, userId })
}

// --- read: SQLite row -> Pinia item shape -------------------------------------

export const rowToTrn = (row: Row): TrnItem | null => parse('transactions', trnItemSchema, row)

export const rowToWallet = (row: Row): WalletItem | null => parse('wallets', walletItemSchema, row)

export function rowToCategory(row: Row): CategoryItem | null {
  const item = rowToItem('categories', row)
  const parsed = categoryFormSchema.safeParse(item)
  if (!parsed.success) {
    logger.error('skipped invalid categories row', row.id, parsed.error.issues)
    return null
  }
  // A root category has no parent_id; the client keeps 0 as its root sentinel.
  return { ...parsed.data, createdAt: item.createdAt as number, sortOrder: (item.sortOrder as number) ?? 0, updatedAt: item.updatedAt as number }
}

// A loan's id is its wallet's id.
export const rowToLoan = (row: Row): LoanItem | null => parse('loans', loanItemSchema, row, { walletId: row.id })

export function rowToLoanScheduleOverride(row: Row): LoanScheduleOverrideItem | null {
  return parse('loan_schedule_overrides', loanScheduleOverrideSchema, row)
}

export const rowToBankReport = (row: Row): BankReport | null => parse('bank_reports', bankReportSchema, row)

export function rowToRates(row: Row): Rates | null {
  const rates = rowToItem('exchange_rates', row).rates
  return rates && typeof rates === 'object' ? rates as Rates : null
}

// --- write: Pinia item shape -> SQLite row ------------------------------------

export const trnToRow = (item: TrnItem, userId: string) => toRow('transactions', item, userId)

export const walletToRow = (item: WalletItem, userId: string) => toRow('wallets', item, userId)

export function categoryToRow(item: CategoryItem, userId: string) {
  return toRow('categories', { ...item, parentId: item.parentId || undefined }, userId)
}

export const loanToRow = (item: LoanItem, userId: string) => toRow('loans', item, userId)

export function loanScheduleOverrideToRow(item: LoanScheduleOverrideItem, userId: string) {
  return toRow('loan_schedule_overrides', item, userId)
}

export const bankReportToRow = (item: BankReport, userId: string) => toRow('bank_reports', item, userId)
