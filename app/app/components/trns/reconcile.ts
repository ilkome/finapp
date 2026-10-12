import type { Row } from '~~/services/powersync/transforms'

import { rowToTrn } from '~~/services/powersync/transforms'

import type { Trns } from '~/components/trns/types'

/** Build a fresh trns map from a full row snapshot (initial load). */
export function rowsToTrns(rows: Row[]): Trns | null {
  if (!rows.length)
    return null
  const map: Trns = {}
  for (const row of rows)
    map[row.id] = rowToTrn(row)
  return map
}

/**
 * Reconcile a full row snapshot from the watch against the previous item map.
 *
 * - Returns `prev` unchanged (same reference) when nothing changed, so the
 *   caller can skip the update entirely - this suppresses the redundant rebuild
 *   the watch fires as an echo of our own optimistic write.
 * - Otherwise returns a new map, reusing the previous object for every unchanged
 *   row (matched on `updatedAt`) so the transform runs only for rows that were
 *   actually added or changed.
 *
 * A missing `updatedAt` reads as 0 on both sides, so rows without a timestamp
 * compare stably and are correctly suppressed.
 */
export function reconcileRows<T extends { updatedAt?: number }>(
  prev: Record<string, T> | null,
  rows: Row[],
  // null skips a row the transform rejects.
  rowToItem: (row: Row) => T | null,
): Record<string, T> | null {
  const old = prev ?? {}
  const same = (item: T | undefined, row: Row) => !!item && (item.updatedAt ?? 0) === Number(row.updatedAt ?? 0)

  if (rows.length === Object.keys(old).length && rows.every(row => same(old[row.id], row)))
    return prev

  if (!rows.length)
    return null

  const next: Record<string, T> = {}
  for (const row of rows) {
    const existing = old[row.id]
    const item = same(existing, row) ? existing! : rowToItem(row)
    if (item)
      next[row.id] = item
  }
  return next
}

export function reconcileTrns(prev: Trns, rows: Row[]): Trns | null {
  return reconcileRows(prev, rows, rowToTrn) as Trns | null
}
