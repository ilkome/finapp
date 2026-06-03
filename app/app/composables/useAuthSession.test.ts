import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AUTH_STORAGE_KEY, getPersistedSession, getPersistedUid, hasPersistedSession } from '~/composables/useAuthSession'

let store: Record<string, string>

function makeSession(uid = 'user-123', expiresAt: number | undefined = 9999999999) {
  return JSON.stringify({
    access_token: 'a',
    expires_at: expiresAt,
    refresh_token: 'r',
    user: { email: 'a@b.c', id: uid },
  })
}

describe('useAuthSession', () => {
  beforeEach(() => {
    store = {}
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => store[k] ?? null,
      removeItem: (k: string) => { delete store[k] },
      setItem: (k: string, v: string) => { store[k] = v },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('getPersistedSession', () => {
    it('reads the pinned storage key', () => {
      expect(AUTH_STORAGE_KEY).toBe('finapp.auth')
      store[AUTH_STORAGE_KEY] = makeSession('u1', 1700000000)
      expect(getPersistedUid()).toBe('u1')
    })

    it('parses a valid v2 session (uid + expiresAt)', () => {
      store[AUTH_STORAGE_KEY] = makeSession('u1', 1700000000)
      expect(getPersistedSession()).toEqual({ expiresAt: 1700000000, uid: 'u1' })
    })

    it('passes an expired token optimistically (refresh corrects it)', () => {
      store[AUTH_STORAGE_KEY] = makeSession('u1', 1) // long past
      expect(hasPersistedSession()).toBe(true)
      expect(getPersistedUid()).toBe('u1')
    })

    it('unwraps a legacy { currentSession } shape', () => {
      store[AUTH_STORAGE_KEY] = JSON.stringify({ currentSession: { expires_at: 5, user: { id: 'legacy' } }, expiresAt: 5 })
      expect(getPersistedSession()).toEqual({ expiresAt: 5, uid: 'legacy' })
    })

    it('returns null for a missing token', () => {
      expect(getPersistedSession()).toBeNull()
      expect(hasPersistedSession()).toBe(false)
      expect(getPersistedUid()).toBeNull()
    })

    it('returns null for malformed JSON', () => {
      store[AUTH_STORAGE_KEY] = '{ not json'
      expect(hasPersistedSession()).toBe(false)
    })

    it('returns null when the token has no user id', () => {
      store[AUTH_STORAGE_KEY] = JSON.stringify({ access_token: 'a', user: {} })
      expect(hasPersistedSession()).toBe(false)
    })

    it('returns null (does not throw) when localStorage access throws', () => {
      vi.stubGlobal('localStorage', {
        getItem: () => { throw new Error('blocked') },
      })
      expect(getPersistedSession()).toBeNull()
    })
  })
})
