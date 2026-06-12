import type { CrudEntry } from '@powersync/web'

export type DivergencePlan = {
  /** True when any non-PUT op diverged; only a full re-sync can restore those. */
  needsReload: boolean
  /** Local rows to delete - rejected inserts (PUT) the server never accepted. */
  toRevert: { id: string, table: string }[]
}

/**
 * Classify the ops discarded from a fatally-rejected upload into a reconciliation
 * plan (pure, see uploadReconcile.test.ts):
 * - All PUTs (rejected inserts) -> delete each local row (ids are client-generated, so
 *   the server has nothing; a 23505 conflict just means a different server row).
 * - Any PATCH/DELETE -> server still holds the prior version and PowerSync can't re-pull
 *   per row, so a full re-sync is required (toRevert stays empty; the paths are exclusive).
 */
export function planDivergence(divergedOps: CrudEntry[]): DivergencePlan {
  if (!divergedOps.length)
    return { needsReload: false, toRevert: [] }

  // String literal instead of the UpdateType enum: a runtime import here would statically
  // pull @powersync/web into the entry chunk via the plugin (it stays lazy, see db.ts).
  const allPut = divergedOps.every(op => (op.op as string) === 'PUT')
  if (!allPut)
    return { needsReload: true, toRevert: [] }

  return {
    needsReload: false,
    toRevert: divergedOps.map(op => ({ id: op.id, table: op.table })),
  }
}
