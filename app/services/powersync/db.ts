import type { PowerSyncDatabase } from '@powersync/web'
import type { SupabaseClient } from '@supabase/supabase-js'

import { createLogger } from '~/utils/logger'

const logger = createLogger('powersync')

let _db: PowerSyncDatabase | null = null
let _dbPromise: Promise<PowerSyncDatabase> | null = null
let _dbInitPromise: Promise<void> | null = null
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

const _ownerListeners = new Set<() => void>()

function setLocalDbOwner(uid: string): void {
  try {
    globalThis.localStorage?.setItem(DB_OWNER_KEY, uid)
  }
  catch {}
  for (const listener of _ownerListeners)
    listener()
}

function clearLocalDbOwner(): void {
  try {
    globalThis.localStorage?.removeItem(DB_OWNER_KEY)
  }
  catch {}
  for (const listener of _ownerListeners)
    listener()
}

/**
 * Resolves `true` once local SQLite holds no other user's rows: the owner is `userId` or the
 * db was wiped (null). The plugin's connect does the wiping; this only waits for it, so the
 * data path never races a second connect. `false` when nothing settles within `timeoutMs`.
 */
export function waitForLocalDbOwner(userId: string, timeoutMs = 30000): Promise<boolean> {
  const isSafe = () => {
    const owner = getLocalDbOwner()
    return !owner || owner === userId
  }
  if (isSafe())
    return Promise.resolve(true)
  return new Promise((resolve) => {
    let timer: ReturnType<typeof setTimeout>
    const check = () => {
      if (!isSafe())
        return
      clearTimeout(timer)
      _ownerListeners.delete(check)
      resolve(true)
    }
    timer = setTimeout(() => {
      _ownerListeners.delete(check)
      resolve(false)
    }, timeoutMs)
    _ownerListeners.add(check)
  })
}

/**
 * Singleton PowerSync database (local SQLite, WASM + IndexedDB VFS: multi-tab, no COOP/COEP).
 * `@powersync/web` (+ schema) is dynamically imported on first call so its bundle stays out of
 * the entry chunk - the login page and demo mode never parse it.
 */
export function getPowerSyncDb(): Promise<PowerSyncDatabase> {
  _dbPromise ??= (async () => {
    const [{ LogLevels, PowerSyncDatabase }, { AppSchema }, { default: workerUrl }] = await Promise.all([
      import('@powersync/web'),
      import('./AppSchema'),
      import('@powersync/web/bundled_worker?worker&url'),
    ])
    _db = new PowerSyncDatabase({
      database: {
        dbFilename: 'finapp.db',
        // The in-app review browser exposes `SharedWorker` but cannot start a module one, so
        // PowerSync's shared worker dies and the app never leaves the skeleton. `pnpm dev:review`
        // sets the flag; every other run exercises the real multi-tab path.
        ...(import.meta.env.VITE_POWERSYNC_SINGLE_TAB ? { enableMultiTabs: false } : {}),
        worker: workerUrl,
      },
      logger: {
        log: ({ error, level, message }) => {
          if (level < LogLevels.info)
            return
          // Being offline is the normal case for this app, not a fault: a failed connect or
          // stream is a warning so the console stays readable for real errors.
          const isNetwork = !globalThis.navigator?.onLine || /fetch|network|connect|stream|socket|abort/i.test(`${message} ${error ?? ''}`)
          const args = error === undefined ? [message] : [message, error]
          if (level >= LogLevels.error && !isNetwork)
            logger.error(...args)
          else if (level >= LogLevels.warn)
            logger.warn(...args)
          else
            logger.log(...args)
        },
      },
      schema: AppSchema,
      sync: {
        worker: workerUrl,
      },
    })
    return _db
  })()
  return _dbPromise
}

/**
 * Initialize the browser SQLite worker exactly once. A returning session starts this during
 * boot, while the auth watcher connects shortly after; PowerSync cannot safely overlap them.
 */
export async function initializePowerSyncDb(): Promise<void> {
  const db = await getPowerSyncDb()
  _dbInitPromise ??= db.init().catch((error) => {
    _dbInitPromise = null
    throw error
  })
  return _dbInitPromise
}

// Fires when a wipe discards not-yet-uploaded ops (foreign-owner wipe or force resync),
// so the app can tell the user instead of losing them silently.
let _onDiscardedPending: ((count: number) => void) | null = null

export function setDiscardedPendingHandler(handler: ((count: number) => void) | null): void {
  _onDiscardedPending = handler
}

/** Disconnect and wipe local SQLite, resetting connection + owner state. */
async function wipeLocalDb(): Promise<void> {
  const db = await getPowerSyncDb()
  const pending = (await db.getUploadQueueStats()).count
  if (pending > 0) {
    logger.warn(`wiping local db with ${pending} unsynced op(s)`)
    _onDiscardedPending?.(pending)
  }
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
  await initializePowerSyncDb()
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

/**
 * Stop syncing but KEEP local SQLite and the unsynced upload queue (unlike
 * disconnectPowerSync, which clears them). Used when the auth session is lost
 * involuntarily (token revoked/expired) so pending offline writes survive until the
 * user re-authenticates - re-connecting as the same uid then drains the queue. The
 * owner marker is intentionally left in place so the same-user reconnect skips the wipe.
 */
export async function pausePowerSync(): Promise<void> {
  if (!_dbPromise)
    return
  _connected = false
  const db = await _dbPromise
  await db.disconnect()
  logger.log('paused (local data kept)')
}

/** Number of not-yet-uploaded operations in the local CRUD queue. */
export async function getPendingUploadCount(): Promise<number> {
  const db = await getPowerSyncDb()
  return (await db.getUploadQueueStats()).count
}

/**
 * Wait until the upload queue is empty or `timeoutMs` passes. Resolves with the number
 * of ops still pending (0 = drained). Sign-out must not wipe while this is non-zero.
 */
export async function waitForUploadsDrained(timeoutMs = 8000): Promise<number> {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const pending = await getPendingUploadCount()
    if (pending === 0 || Date.now() >= deadline)
      return pending
    await new Promise(resolve => setTimeout(resolve, Math.min(250, Math.max(0, deadline - Date.now()))))
  }
}

export type SyncStatusSnapshot = { connected: boolean, pending: number, uploadError: string | null }

const SYNCED_TABLES = ['categories', 'stat_views', 'trns', 'user_settings', 'wallets'] as const

/**
 * Observe connection + upload-queue state for the UI. `onChange` fires on every PowerSync
 * status change and on every local write (each touches the queue). Returns a stop function.
 */
export function subscribeSyncStatus(onChange: (s: SyncStatusSnapshot) => void): () => void {
  const stops: (() => void)[] = []
  let stopped = false
  getPowerSyncDb()
    .then((db) => {
      if (stopped)
        return
      const refresh = async () => {
        const status = db.currentStatus
        const pending = (await db.getUploadQueueStats()).count
        // A failed upload while disconnected is just "offline", not a server rejection.
        const uploadError = status.connected ? (status.dataFlowStatus.uploadError?.message ?? null) : null
        if (!stopped)
          onChange({ connected: status.connected, pending, uploadError })
      }
      stops.push(db.registerListener({ statusChanged: () => void refresh() }))
      stops.push(db.onChangeWithCallback({ onChange: () => void refresh() }, { tables: [...SYNCED_TABLES], throttleMs: 500 }))
      void refresh()
    })
    .catch((e: unknown) => logger.error('sync status subscribe failed', e))
  return () => {
    stopped = true
    for (const stop of stops)
      stop()
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
