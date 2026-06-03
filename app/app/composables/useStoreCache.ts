import { debounce } from 'es-toolkit'
import localforage from 'localforage'

import { getPersistedUid } from '~/composables/useAuthSession'
import { isPersistBlocked } from '~/composables/useStoreSync'
import { createLogger } from '~/utils/logger'

// Per-user localforage snapshot of the watch-driven stores, read at cold start to paint the
// dashboard from the last session before PowerSync's db.init + first query scan finish; the live
// watches then reconcile to SQLite truth. One blob = a single IndexedDB read of an internally
// consistent snapshot. Stores toRaw() reactive refs first (IndexedDB can't clone a Vue proxy).
// Keyed by uid so users never read each other's snapshot. Demo mode uses its own cache.

const logger = createLogger('cache')

export type CacheSlice = 'categories' | 'rates' | 'trns' | 'user' | 'wallets'

export type StoreSnapshot = Partial<Record<CacheSlice, unknown>>

// In-memory accumulator of this session's latest slice values. The debounced write merges it
// over the on-disk blob (read-modify-write) so a single-slice write never drops other slices.
const snapshot: StoreSnapshot = {}

function cacheKey(uid: string): string {
  return `finapp.cache.${uid}`
}

/** Read the current user's whole snapshot. Null when absent or no session. */
export async function readStoreCache(): Promise<StoreSnapshot | null> {
  const uid = getPersistedUid()
  if (!uid)
    return null
  try {
    return await localforage.getItem<StoreSnapshot>(cacheKey(uid))
  }
  catch (e) {
    logger.error('read err', e)
    return null
  }
}

let persist: (() => void) | null = null

/** Update one slice and persist the snapshot (debounced, per-user). No-op while persist is blocked. */
export function persistStoreCache(slice: CacheSlice, data: unknown): void {
  if (isPersistBlocked() || !getPersistedUid())
    return
  snapshot[slice] = data
  if (!persist) {
    persist = debounce(() => {
      const uid = getPersistedUid()
      if (!uid)
        return
      // Read-modify-write: merge this session's touched slices over what's on disk.
      void localforage.getItem<StoreSnapshot>(cacheKey(uid))
        .then(existing => localforage.setItem(cacheKey(uid), { ...existing, ...snapshot }))
        .catch(e => logger.error('WRITE err', e))
    }, 400)
  }
  persist()
}

/** Remove a user's snapshot (sign-out / wipe). Defaults to the current session uid. */
export async function clearStoreCache(uid?: string | null): Promise<void> {
  for (const key of Object.keys(snapshot))
    delete snapshot[key as CacheSlice]
  const target = uid ?? getPersistedUid()
  if (!target)
    return
  await localforage.removeItem(cacheKey(target)).catch(() => {})
}
