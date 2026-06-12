import type { PowerSyncDatabase } from '@powersync/web'
import type { SupabaseClient } from '@supabase/supabase-js'

import { createLogger } from '~/utils/logger'

const logger = createLogger('powersync')

let _db: PowerSyncDatabase | null = null
let _dbPromise: Promise<PowerSyncDatabase> | null = null
let _connected = false
// Serializes connect/wipe so the plugin watcher and the data-load path can't race into a double wipe.
let _connectQueue: Promise<void> = Promise.resolve()

const DB_OWNER_KEY = 'finapp.psDbOwnerUid'

/**
 * The uid that owns the data currently in local SQLite. Persisted so a failed
 * sign-out clear (or a different user signing in) is detected on the next connect
 * and stale rows are wiped before they can leak across users.
 */
export function getLocalDbOwner(): string | null {
  try {
    return globalThis.localStorage?.getItem(DB_OWNER_KEY) ?? null
  }
  catch {
    return null
  }
}

function setLocalDbOwner(uid: string): void {
  try {
    globalThis.localStorage?.setItem(DB_OWNER_KEY, uid)
  }
  catch {}
}

function clearLocalDbOwner(): void {
  try {
    globalThis.localStorage?.removeItem(DB_OWNER_KEY)
  }
  catch {}
}

/**
 * Singleton PowerSync database (local SQLite, WASM + IndexedDB VFS: multi-tab, no COOP/COEP).
 * `@powersync/web` (+ schema) is dynamically imported on first call so its ~300KB stays out of
 * the entry chunk - the login page and demo mode never parse it.
 */
export function getPowerSyncDb(): Promise<PowerSyncDatabase> {
  _dbPromise ??= (async () => {
    const [{ PowerSyncDatabase, WASQLiteOpenFactory, WASQLiteVFS }, { AppSchema }] = await Promise.all([
      import('@powersync/web'),
      import('./AppSchema'),
    ])
    _db = new PowerSyncDatabase({
      database: new WASQLiteOpenFactory({
        dbFilename: 'finapp.db',
        vfs: WASQLiteVFS.IDBBatchAtomicVFS,
      }),
      schema: AppSchema,
    })
    return _db
  })()
  return _dbPromise
}

/** Disconnect and wipe local SQLite, resetting connection + owner state. */
async function wipeLocalDb(): Promise<void> {
  const db = await getPowerSyncDb()
  await db.disconnectAndClear()
  _connected = false
  clearLocalDbOwner()
  logger.log('local db wiped')
}

async function doConnect(client: SupabaseClient, powerSyncUrl: string, userId: string): Promise<void> {
  const [db, { SupabaseConnector }] = await Promise.all([
    getPowerSyncDb(),
    import('./connector'),
  ])
  // Cross-user guard: wipe another user's rows before connecting. Fail closed -
  // if the wipe throws we do NOT connect, so the new user can't read stale data.
  const owner = getLocalDbOwner()
  if (owner && owner !== userId)
    await wipeLocalDb()

  if (_connected)
    return

  try {
    await db.connect(new SupabaseConnector(client, powerSyncUrl))
    _connected = true
    setLocalDbOwner(userId)
    logger.log('connected')
  }
  catch (e) {
    _connected = false
    logger.error('connect failed', e)
    throw e
  }
}

/** Connect to PowerSync for `userId`. Idempotent, serialized, wipes local SQLite if it belongs to another user. */
export function connectPowerSync(client: SupabaseClient, powerSyncUrl: string, userId: string): Promise<void> {
  const run = _connectQueue.catch(() => {}).then(() => doConnect(client, powerSyncUrl, userId))
  _connectQueue = run.catch(() => {})
  return run
}

/**
 * Force a full re-sync: wipe local SQLite then reconnect so server data is re-pulled.
 * DESTRUCTIVE (discards not-yet-uploaded offline writes) - must be user-initiated.
 * Goes through the shared queue and wipes even for the same owner.
 */
export function forceResync(client: SupabaseClient, powerSyncUrl: string, userId: string): Promise<void> {
  const run = _connectQueue.catch(() => {}).then(async () => {
    await wipeLocalDb()
    await doConnect(client, powerSyncUrl, userId)
  })
  _connectQueue = run.catch(() => {})
  return run
}

/**
 * Disconnect and wipe local data (sign-out). Returns whether the wipe succeeded;
 * on failure the owner marker is kept so the next foreign sign-in wipes first.
 */
export async function disconnectPowerSync(): Promise<boolean> {
  if (!_dbPromise) {
    clearLocalDbOwner()
    return true
  }
  _connected = false
  try {
    const db = await _dbPromise
    await db.disconnectAndClear()
    clearLocalDbOwner()
    logger.log('disconnected and cleared')
    return true
  }
  catch (e) {
    logger.error('disconnect failed', e)
    return false
  }
}

/** Resolves `true` once the first full sync completes; `false` on timeout / not connected. */
export async function waitForFirstSync(timeoutMs = 30000): Promise<boolean> {
  const db = await getPowerSyncDb()
  if (db.currentStatus?.hasSynced)
    return true
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    await db.waitForFirstSync({ signal: controller.signal })
    return !!db.currentStatus?.hasSynced
  }
  catch {
    return false
  }
  finally {
    clearTimeout(timer)
  }
}

export async function hasAnyLocalData(): Promise<boolean> {
  const db = await getPowerSyncDb()
  for (const table of ['wallets', 'categories', 'trns'] as const) {
    const row = await db.get<{ c: number }>(`SELECT count(*) as c FROM ${table}`)
    if ((row?.c ?? 0) > 0)
      return true
  }
  return false
}

/**
 * Subscribe to a query. `onRows` fires immediately with current local rows and again
 * on every change (local write or incoming sync). Returns an AbortController to stop.
 */
export function watchTable<TRow = Record<string, unknown>>(
  sql: string,
  params: unknown[],
  onRows: (rows: TRow[]) => void,
  throttleMs?: number,
): AbortController {
  const controller = new AbortController()
  // Cold-start instrumentation: `performance.measure('ps:watch:<label>')` spans subscribe ->
  // first emission, exposing how the boot queries serialize on the single worker connection.
  const label = sql.replace(/SELECT \* FROM /, '').slice(0, 32)
  performance.mark(`ps:watch:${label}:queued`)
  let isFirstEmit = true
  getPowerSyncDb()
    .then((db) => {
      if (controller.signal.aborted)
        return
      performance.mark(`ps:watch:${label}:armed`)
      db.watch(
        sql,
        params,
        {
          onError: (e: Error) => logger.error(`watch error: ${sql}`, e),
          onResult: (result: { rows?: { _array: unknown[] } }) => {
            const rows = (result.rows?._array ?? []) as TRow[]
            if (isFirstEmit) {
              isFirstEmit = false
              performance.mark(`ps:watch:${label}:first`)
              performance.measure(`ps:watch:${label}`, `ps:watch:${label}:queued`, `ps:watch:${label}:first`)
              logger.log(`first emit ${label}: ${rows.length} rows`)
            }
            onRows(rows)
          },
        },
        // PowerSync coalesces table-change events within `throttleMs` (default 30ms) into one re-query.
        { signal: controller.signal, ...(throttleMs != null ? { throttleMs } : {}) },
      )
    })
    .catch((e: unknown) => logger.error(`watch start failed: ${sql}`, e))
  return controller
}
