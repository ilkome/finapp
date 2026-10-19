import type {
  CommonPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from '@powersync/web'
import type { SupabaseClient } from '@supabase/supabase-js'

import { UpdateType } from '@powersync/web'

import { createLogger } from '~/utils/logger'

import type { SyncedTableName } from './columns'

import { JSON_COLUMNS } from './columns'
import { notifyFatalUploadError } from './uploadErrorHandler'

const logger = createLogger('powersync-connector')

export function prepareUploadData(table: string, data: Record<string, unknown>): Record<string, unknown> {
  const jsonColumns = JSON_COLUMNS[table as SyncedTableName]
  if (!jsonColumns)
    return data

  const prepared = { ...data }
  for (const column of jsonColumns) {
    const value = prepared[column]
    if (typeof value === 'string')
      prepared[column] = JSON.parse(value)
  }
  return prepared
}

// Postgres error codes that retrying can't fix - the op is discarded, not requeued forever.
const FATAL_RESPONSE_CODES = [
  /^22...$/, // data exception (e.g. type mismatch)
  /^23...$/, // integrity constraint violation
  /^42501$/, // insufficient privilege (RLS violation)
  // PostgREST request/schema errors (unknown table/column, bad body): the same op fails
  // identically on every retry and, being first in the FIFO queue, blocks every op behind it.
  // PGRST3xx (JWT) and PGRST5xx (pool) are transient and stay retryable.
  /^PGRST[12]\d\d$/,
]

/**
 * Bridges PowerSync's local write queue to Supabase:
 * - `fetchCredentials` provides the PowerSync endpoint + the current Supabase JWT.
 * - `uploadData` drains queued CRUD operations and applies them via supabase-js.
 */
export class SupabaseConnector implements PowerSyncBackendConnector {
  constructor(
    private readonly client: SupabaseClient,
    private readonly powerSyncUrl: string,
  ) {}

  async fetchCredentials(): Promise<PowerSyncCredentials | null> {
    const { data, error } = await this.client.auth.getSession()
    if (error || !data.session)
      return null

    return {
      endpoint: this.powerSyncUrl,
      token: data.session.access_token,
    }
  }

  async uploadData(database: CommonPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction()
    if (!transaction)
      return

    // First op of the group being applied: a fatal failure discards it plus every op after it.
    let failedIndex = -1
    try {
      const { crud } = transaction
      for (let i = 0; i < crud.length;) {
        failedIndex = i
        const op = crud[i]!
        // Consecutive PUTs / DELETEs on one table go as one request; a PATCH carries its own payload.
        let end = i + 1
        if (op.op !== UpdateType.PATCH) {
          while (end < crud.length && crud[end]!.op === op.op && crud[end]!.table === op.table)
            end++
        }
        const group = crud.slice(i, end)
        i = end

        const table = this.client.from(op.table)
        let result
        switch (op.op) {
          case UpdateType.PUT:
            result = await table.upsert(group.map(o => ({ ...prepareUploadData(o.table, o.opData ?? {}), id: o.id })))
            break
          case UpdateType.PATCH:
            result = await table.update(prepareUploadData(op.table, op.opData ?? {})).eq('id', op.id)
            break
          case UpdateType.DELETE:
            result = await table.delete().in('id', group.map(o => o.id))
            break
        }

        if (result?.error) {
          result.error.message = `Supabase upload failed: ${result.error.message}`
          throw result.error
        }
      }

      await transaction.complete()
    }
    catch (ex: any) {
      if (typeof ex.code === 'string' && FATAL_RESPONSE_CODES.some(re => re.test(ex.code))) {
        // Unrecoverable - discard the transaction so the queue isn't blocked. Ops before
        // failedIndex already committed server-side; the failing op and those after it
        // never reached the server, so only those diverge and need reconciling.
        const divergedOps = transaction.crud.slice(failedIndex)
        logger.error('discarding fatal upload error', divergedOps, ex)
        notifyFatalUploadError(ex, divergedOps)
        await transaction.complete()
      }
      else {
        // Retryable (network/temporary): rethrow so PowerSync retries after a delay.
        throw ex
      }
    }
  }
}
