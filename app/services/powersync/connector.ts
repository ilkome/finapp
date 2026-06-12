import type {
  AbstractPowerSyncDatabase,
  PowerSyncBackendConnector,
  PowerSyncCredentials,
} from '@powersync/web'
import type { SupabaseClient } from '@supabase/supabase-js'

import { UpdateType } from '@powersync/web'

import { createLogger } from '~/utils/logger'

import { notifyFatalUploadError } from './uploadErrorHandler'

const logger = createLogger('powersync-connector')

// Postgres error codes that retrying can't fix - the op is discarded, not requeued forever.
const FATAL_RESPONSE_CODES = [
  /^22...$/, // data exception (e.g. type mismatch)
  /^23...$/, // integrity constraint violation
  /^42501$/, // insufficient privilege (RLS violation)
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

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction()
    if (!transaction)
      return

    // Op currently being applied: a fatal failure discards it plus every op after it.
    let failedIndex = -1
    try {
      for (const [i, op] of transaction.crud.entries()) {
        failedIndex = i
        const table = this.client.from(op.table)
        let result
        switch (op.op) {
          case UpdateType.PUT: {
            const record = { ...op.opData, id: op.id }
            result = await table.upsert(record)
            break
          }
          case UpdateType.PATCH:
            result = await table.update(op.opData!).eq('id', op.id)
            break
          case UpdateType.DELETE:
            result = await table.delete().eq('id', op.id)
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
