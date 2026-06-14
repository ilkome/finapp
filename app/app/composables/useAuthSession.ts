// The persisted Supabase session in localStorage is the synchronous "is logged in" gate:
// readable the instant route middleware runs (before async getSession resolves), so an
// already-logged-in user never flashes /login -> /dashboard on a cold start.

// The localStorage key supabase-js persists the session under (pinned via `auth.storageKey`
// in useSupabase) so the synchronous route gate can read it directly.
export const AUTH_STORAGE_KEY = 'finapp.auth'

type PersistedSession = {
  // Unix seconds; null when absent. Optimistic gate: an almost-expired token still passes
  // (autoRefreshToken + useGuard correct it later).
  expiresAt: number | null
  uid: string
}

/**
 * Parse the stored token. supabase-js v2 serialises the Session directly; older gotrue shapes
 * wrapped it in `{ currentSession }`/`{ session }`. Probe all three so a format change degrades
 * to "logged out" rather than throwing in middleware.
 */
function parsePersisted(raw: string): PersistedSession | null {
  try {
    const data = JSON.parse(raw) as Record<string, any>
    const s = data?.user ? data : (data?.currentSession ?? data?.session)
    const uid = s?.user?.id
    if (typeof uid !== 'string' || !uid)
      return null
    return {
      expiresAt: typeof s?.expires_at === 'number' ? s.expires_at : null,
      uid,
    }
  }
  catch {
    return null
  }
}

export function getPersistedSession(): PersistedSession | null {
  let raw: string | null = null
  try {
    raw = globalThis.localStorage?.getItem(AUTH_STORAGE_KEY) ?? null
  }
  catch {
    return null // localStorage blocked (private mode / SSR) - treat as logged out
  }
  return raw ? parsePersisted(raw) : null
}

/** Optimistic synchronous gate: a stored session with a uid exists. */
export function hasPersistedSession(): boolean {
  return getPersistedSession() !== null
}

/** The persisted uid, available synchronously before the async session resolves. */
export function getPersistedUid(): string | null {
  return getPersistedSession()?.uid ?? null
}

/**
 * The uid to stamp on a local row write. Prefers the reactive session uid, but falls
 * back to the synchronously-persisted uid so writes made before the async session
 * resolves (e.g. an offline cold start with an expired access token, where getSession
 * returns null) aren't stamped with an empty userId - which RLS would reject on upload.
 */
export function resolveWriteUid(reactiveUid: string | null): string {
  return reactiveUid ?? getPersistedUid() ?? ''
}
