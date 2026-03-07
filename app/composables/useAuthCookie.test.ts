import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('useAuthCookie', () => {
  let cookieJar: string

  beforeEach(() => {
    cookieJar = ''
    vi.stubGlobal('document', {
      get cookie() { return cookieJar },
      set cookie(val: string) { cookieJar = val },
    })
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('hasAuthCookie', () => {
    it('returns true when cookie exists', async () => {
      const { hasAuthCookie } = await import('~/composables/useAuthCookie')
      cookieJar = 'other=1; finapp.localAuthUid=abc'
      expect(hasAuthCookie()).toBe(true)
    })

    it('returns false when cookie absent', async () => {
      const { hasAuthCookie } = await import('~/composables/useAuthCookie')
      cookieJar = 'other=1'
      expect(hasAuthCookie()).toBe(false)
    })
  })

  describe('setAuthCookie', () => {
    it('writes cookie with correct flags', async () => {
      const { setAuthCookie } = await import('~/composables/useAuthCookie')
      setAuthCookie('user-123')
      expect(cookieJar).toBe('finapp.localAuthUid=user-123;path=/;max-age=31536000;SameSite=Lax')
    })

    it('encodes uid to prevent cookie injection', async () => {
      const { setAuthCookie } = await import('~/composables/useAuthCookie')
      setAuthCookie('a=b;c=d')
      expect(cookieJar).toContain('finapp.localAuthUid=a%3Db%3Bc%3Dd')
    })
  })

  describe('clearAuthCookie', () => {
    it('flags match setAuthCookie with max-age=0', async () => {
      const { clearAuthCookie } = await import('~/composables/useAuthCookie')
      clearAuthCookie()
      expect(cookieJar).toBe('finapp.localAuthUid=;path=/;max-age=0;SameSite=Lax')
    })
  })

  describe('secure flag', () => {
    it('included on https', async () => {
      vi.stubGlobal('location', { protocol: 'https:' })
      vi.resetModules()
      const { setAuthCookie } = await import('~/composables/useAuthCookie')
      setAuthCookie('uid')
      expect(cookieJar).toContain(';Secure')
    })

    it('omitted on http', async () => {
      vi.stubGlobal('location', { protocol: 'http:' })
      vi.resetModules()
      const { setAuthCookie } = await import('~/composables/useAuthCookie')
      setAuthCookie('uid')
      expect(cookieJar).not.toContain('Secure')
    })
  })
})
