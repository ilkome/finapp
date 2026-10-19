import { debounce } from 'es-toolkit'
import localforage from 'localforage'

import { getPersistedUid } from '~/composables/useAuthSession'
import { isPersistBlocked } from '~/composables/useStoreSync'
import { createLogger } from '~/utils/logger'

// Per-user localforage snapshot of the watch-driven stores, read at cold start to paint the
// dashboard from the last session before PowerSync's db.init + first query scan finish; the live
// watches then reconcile to SQLite truth. One key per slice, so a wallet reorder or a rates tick
// does not re-clone the whole trns map into IndexedDB. Stores toRaw() reactive refs first
// (IndexedDB can't clone a Vue proxy). Keyed by uid so users never read each other's snapshot.
// Demo mode uses its own cache.

const logger = createLogger('cache')

const SLICES = ['bankReports', 'categories', 'displayOverrides', 'loans', 'rates', 'statViews', 'trns', 'user', 'wallets'] as const

type CacheSlice = typeof SLICES[number]

type StoreSnapshot = Partial<Record<CacheSlice, unknown>>

// Slices changed since the last flush; the debounced write stores only these.
const pending: StoreSnapshot = {}

function legacyKey(uid: string): string {
  return `finapp.cache.${uid}`
}

function sliceKey(uid: string, slice: CacheSlice): string {
  return `${legacyKey(uid)}.${slice}`
}

/** Split the pre-slice single blob into slice keys once. A slice persisted this session wins. */
async function migrateLegacy(uid: string, stored: StoreSnapshot): Promise<void> {
  await Promise.all(SLICES
    .filter(slice => stored[slice] !== undefined && !(slice in pending))
    .map(slice => localforage.setItem(sliceKey(uid, slice), stored[slice])))
  await localforage.removeItem(legacyKey(uid))
}

/** Read the current user's whole snapshot. Null when absent or no session. */
export async function readStoreCache(): Promise<StoreSnapshot | null> {
  const uid = getPersistedUid()
  if (!uid)
    return null
  try {
    const legacy = await localforage.getItem<StoreSnapshot>(legacyKey(uid))
    if (legacy) {
      await migrateLegacy(uid, legacy)
      return legacy
    }
    const values = await Promise.all(SLICES.map(slice => localforage.getItem(sliceKey(uid, slice))))
    const stored: StoreSnapshot = {}
    SLICES.forEach((slice, i) => {
      if (values[i] != null)
        stored[slice] = values[i]
    })
    return Object.keys(stored).length ? stored : null
  }
  catch (e) {
    logger.error('read err', e)
    return null
  }
}

let persist: (() => void) | null = null

/** Update one slice and persist it (debounced, per-user). No-op while persist is blocked. */
export function persistStoreCache(slice: CacheSlice, data: unknown): void {
  if (isPersistBlocked() || !getPersistedUid())
    return
  pending[slice] = data
  if (!persist) {
    persist = debounce(() => {
      const uid = getPersistedUid()
      if (!uid)
        return
      for (const [slice, value] of Object.entries(pending)) {
        delete pending[slice as CacheSlice]
        void localforage.setItem(sliceKey(uid, slice as CacheSlice), value)
          .catch(e => logger.error('WRITE err', e))
      }
    }, 400)
  }
  persist()
}

/** Remove a user's snapshot (sign-out / wipe). Defaults to the current session uid. */
export async function clearStoreCache(uid?: string | null): Promise<void> {
  for (const key of Object.keys(pending))
    delete pending[key as CacheSlice]
  const target = uid ?? getPersistedUid()
  if (!target)
    return
  await Promise.all([legacyKey(target), ...SLICES.map(slice => sliceKey(target, slice))]
    .map(key => localforage.removeItem(key).catch(() => {})))
}
