import type { LockContext } from '@powersync/web'

import { getPowerSyncDb } from './db'

// PowerSync client tables are SQLite views with INSTEAD OF triggers: they take plain
// INSERT/UPDATE/DELETE but not `INSERT ... ON CONFLICT`, so upsert = existence check + INSERT/UPDATE.

// Every mutation targets one of these trusted literals (callers never pass user input). The
// guard hardens the string-interpolated SQL below; column names come from transforms.ts (fixed
// keys) and row values are always parameterized.
const WRITABLE_TABLES = new Set(['budget_assignments', 'budgets', 'categories', 'recurrences', 'trns', 'user_settings', 'wallets'])

function assertTable(table: string): void {
  if (!WRITABLE_TABLES.has(table))
    throw new Error(`Refusing to mutate unknown table: ${table}`)
}

async function upsertWith(
  ctx: { execute: LockContext['execute'], getOptional: LockContext['getOptional'] },
  table: string,
  id: string,
  row: Record<string, unknown>,
): Promise<void> {
  assertTable(table)
  const cols = Object.keys(row)
  const exists = await ctx.getOptional<{ id: string }>(`SELECT id FROM ${table} WHERE id = ?`, [id])

  if (exists) {
    const sets = cols.map(c => `"${c}" = ?`).join(', ')
    await ctx.execute(`UPDATE ${table} SET ${sets} WHERE id = ?`, [...cols.map(c => row[c]), id])
  }
  else {
    const quoted = cols.map(c => `"${c}"`).join(', ')
    const placeholders = cols.map(() => '?').join(', ')
    await ctx.execute(`INSERT INTO ${table} (id, ${quoted}) VALUES (?, ${placeholders})`, [id, ...cols.map(c => row[c])])
  }
}

/**
 * Insert or update a row by id. PowerSync queues the change and syncs it to Supabase.
 * `row` holds SQLite-ready column values (transforms.ts); the caller owns the id.
 */
export async function upsertRow(table: string, id: string, row: Record<string, unknown>): Promise<void> {
  // Existence check + INSERT/UPDATE in one transaction (atomic, single lock).
  const db = await getPowerSyncDb()
  await db.writeTransaction(async (tx) => {
    await upsertWith(tx, table, id, row)
  })
}

export async function deleteRow(table: string, id: string): Promise<void> {
  assertTable(table)
  const db = await getPowerSyncDb()
  await db.execute(`DELETE FROM ${table} WHERE id = ?`, [id])
}

/**
 * Delete local trns referencing a wallet/category. Used when a rejected wallet/category
 * INSERT is reverted, so optimistically-created trns don't survive as orphans. The deletes
 * are queued for upload too, converging the server if any of those trns reached it.
 */
export async function deleteTrnsReferencing(table: 'categories' | 'wallets', id: string): Promise<void> {
  const db = await getPowerSyncDb()
  if (table === 'wallets')
    await db.execute('DELETE FROM trns WHERE "walletId" = ? OR "expenseWalletId" = ? OR "incomeWalletId" = ?', [id, id, id])
  else
    await db.execute('DELETE FROM trns WHERE "categoryId" = ?', [id])
}

/** Upsert several rows in a single write transaction (e.g. wallet reordering). */
export async function upsertRows(table: string, rows: { id: string, row: Record<string, unknown> }[]): Promise<void> {
  const db = await getPowerSyncDb()
  await db.writeTransaction(async (tx) => {
    for (const { id, row } of rows)
      await upsertWith(tx, table, id, row)
  })
}
