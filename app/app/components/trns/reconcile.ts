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
 *   row (matched on `updatedAt`) so the O(N) `rowToTrn` transform runs only for
 *   rows that were actually added or changed.
 *
 * `updatedAt` reads deterministically (null -> 0, see transforms.ts), so even
 * rows without a timestamp compare stably and are correctly suppressed.
 */
export function reconcileTrns(prev: Trns, rows: Row[]): Trns | null {
  let dirty = rows.length !== Object.keys(prev).length
  if (!dirty) {
    for (const row of rows) {
      const existing = prev[row.id]
      if (!existing || existing.updatedAt !== Number(row.updatedAt)) {
        dirty = true
        break
      }
    }
  }
  if (!dirty)
    return prev

  if (!rows.length)
    return null

  const next: Trns = {}
  for (const row of rows) {
    const existing = prev[row.id]
    next[row.id] = existing && existing.updatedAt === Number(row.updatedAt)
      ? existing
      : rowToTrn(row)
  }
  return next
}
