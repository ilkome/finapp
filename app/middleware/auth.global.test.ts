import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Shared mock state (hoisted so vi.mock factories can reference them)
// ---------------------------------------------------------------------------
const {
  clearAuthCookieMock,
  getSessionMock,
  hasAuthCookieMock,
  isDemoRef,
  isSessionInitializedMock,
  navigateToMock,
  setAuthCookieMock,
  setSessionInitializedMock,
} = vi.hoisted(() => {
  let _sessionInitialized = false
  const isSessionInitializedMock = vi.fn(() => _sessionInitialized)
  const setSessionInitializedMock = vi.fn((value: boolean) => {
    _sessionInitialized = value
  })

  return {
    clearAuthCookieMock: vi.fn(),
    getSessionMock: vi.fn(),
    hasAuthCookieMock: vi.fn(() => false),
    isDemoRef: { value: false },
    isSessionInitializedMock,
    navigateToMock: vi.fn(),
    setAuthCookieMock: vi.fn(),
    setSessionInitializedMock,
  }
})

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------
vi.mock('~/components/demo/useDemo', () => ({
  useDemo: () => ({ isDemo: isDemoRef }),
}))

vi.mock('~/composables/useAuthCookie', () => ({
  clearAuthCookie: clearAuthCookieMock,
  hasAuthCookie: hasAuthCookieMock,
  isSessionInitialized: isSessionInitializedMock,
  setAuthCookie: setAuthCookieMock,
  setSessionInitialized: setSessionInitializedMock,
}))

vi.mock('~/utils/logger', () => ({
  createLogger: () => ({ error: vi.fn(), info: vi.fn(), warn: vi.fn() }),
}))

// ---------------------------------------------------------------------------
// Nuxt auto-import stubs
// ---------------------------------------------------------------------------
vi.stubGlobal('defineNuxtRouteMiddleware', (fn: any) => fn)
vi.stubGlobal('navigateTo', navigateToMock)
vi.stubGlobal('navigator', { onLine: true })
vi.stubGlobal('useAuth', () => ({ getSession: getSessionMock }))
vi.stubGlobal('getSafeRedirectPath', (value: unknown) => {
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//'))
    return value
  return '/dashboard'
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function createRoute(path: string, query: Record<string, string> = {}) {
  const qs = Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')
  return { fullPath: qs ? `${path}?${qs}` : path, path, query }
}

async function flushPromises() {
  await new Promise(resolve => setTimeout(resolve, 0))
}

type MiddlewareFn = (to: ReturnType<typeof createRoute>) => Promise<unknown>

let middleware: MiddlewareFn

async function loadMiddleware(): Promise<MiddlewareFn> {
  if (!middleware) {
    const mod = await import('~/middleware/auth.global')
    middleware = mod.default as MiddlewareFn
  }
  return middleware
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
// SPA mode — all code paths are client-side.

describe('auth.global middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setSessionInitializedMock(false)
    isDemoRef.value = false
    hasAuthCookieMock.mockReturnValue(false)
  })

  // --- OTT handling ---

  describe('oTT handling', () => {
    it('redirects OTT from arbitrary path to /auth/callback', async () => {
      const middleware = await loadMiddleware()
      await middleware(createRoute('/dashboard', { ott: 'abc123' }))

      expect(navigateToMock).toHaveBeenCalledWith(
        { path: '/auth/callback', query: { ott: 'abc123' } },
        { replace: true },
      )
    })

    it('does not redirect OTT already on /auth/callback', async () => {
      const middleware = await loadMiddleware()
      const result = await middleware(createRoute('/auth/callback', { ott: 'abc123' }))

      expect(navigateToMock).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  // --- /auth/callback passthrough ---

  describe('/auth/callback passthrough', () => {
    it('skips all auth checks', async () => {
      const middleware = await loadMiddleware()
      const result = await middleware(createRoute('/auth/callback'))

      expect(navigateToMock).not.toHaveBeenCalled()
      expect(hasAuthCookieMock).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  // --- Demo mode ---

  describe('demo mode', () => {
    beforeEach(() => {
      isDemoRef.value = true
    })

    it('redirects /login to the redirect query path', async () => {
      const middleware = await loadMiddleware()
      await middleware(createRoute('/login', { redirect: '/settings' }))

      expect(navigateToMock).toHaveBeenCalledWith('/settings')
    })

    it('redirects /login to /dashboard without redirect param', async () => {
      const middleware = await loadMiddleware()
      await middleware(createRoute('/login'))

      expect(navigateToMock).toHaveBeenCalledWith('/dashboard')
    })

    it('passes through non-login routes', async () => {
      const middleware = await loadMiddleware()
      const result = await middleware(createRoute('/dashboard'))

      expect(navigateToMock).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  // --- Client: with auth cookie ---

  describe('client: with auth cookie', () => {
    beforeEach(() => {
      hasAuthCookieMock.mockReturnValue(true)
      getSessionMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
    })

    it('passes through protected routes', async () => {
      const middleware = await loadMiddleware()
      const result = await middleware(createRoute('/dashboard'))

      expect(result).toBeUndefined()
      expect(navigateToMock).not.toHaveBeenCalled()
    })

    it('triggers background getSession on first visit', async () => {
      const middleware = await loadMiddleware()
      await middleware(createRoute('/dashboard'))

      expect(getSessionMock).toHaveBeenCalledOnce()
    })

    it('skips getSession on subsequent visits (sessionInitialized)', async () => {
      const middleware = await loadMiddleware()
      await middleware(createRoute('/dashboard'))
      await middleware(createRoute('/settings'))

      expect(getSessionMock).toHaveBeenCalledOnce()
    })

    it('redirects /login to /dashboard', async () => {
      const middleware = await loadMiddleware()
      await middleware(createRoute('/login'))

      expect(navigateToMock).toHaveBeenCalledWith('/dashboard')
    })

    it('clears cookie and redirects when background session expired', async () => {
      getSessionMock.mockResolvedValue({ data: { user: null } })
      const middleware = await loadMiddleware()
      await middleware(createRoute('/dashboard'))
      await flushPromises()

      expect(clearAuthCookieMock).toHaveBeenCalled()
      expect(navigateToMock).toHaveBeenCalledWith('/login')
    })

    it('resets sessionInitialized on expired session so re-login can reinitialize', async () => {
      getSessionMock.mockResolvedValueOnce({ data: { user: null } })
      const middleware = await loadMiddleware()

      // First visit: session expired → clearCookie + redirect
      await middleware(createRoute('/dashboard'))
      await flushPromises()
      expect(clearAuthCookieMock).toHaveBeenCalled()
      expect(getSessionMock).toHaveBeenCalledOnce()

      // Simulate re-login: cookie is back, next navigation should call getSession again
      getSessionMock.mockResolvedValue({ data: { user: { id: 'u2' } } })
      await middleware(createRoute('/settings'))

      expect(getSessionMock).toHaveBeenCalledTimes(2)
    })

    it('resets sessionInitialized on background getSession error', async () => {
      getSessionMock.mockRejectedValueOnce(new Error('network'))
      const middleware = await loadMiddleware()

      // First call: getSession fails
      await middleware(createRoute('/dashboard'))
      await flushPromises()
      expect(getSessionMock).toHaveBeenCalledOnce()

      // Second call: sessionInitialized was reset, so getSession fires again
      getSessionMock.mockResolvedValue({ data: { user: { id: 'u1' } } })
      await middleware(createRoute('/settings'))

      expect(getSessionMock).toHaveBeenCalledTimes(2)
    })
  })

  // --- Client: no auth cookie ---

  describe('client: no auth cookie', () => {
    it('passes through /login without verification', async () => {
      const middleware = await loadMiddleware()
      const result = await middleware(createRoute('/login'))

      expect(navigateToMock).not.toHaveBeenCalled()
      expect(getSessionMock).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it('sets cookie and continues when session is valid', async () => {
      getSessionMock.mockResolvedValue({ data: { user: { id: 'user-42' } } })
      const middleware = await loadMiddleware()
      const result = await middleware(createRoute('/dashboard'))

      expect(setAuthCookieMock).toHaveBeenCalledWith('user-42')
      expect(navigateToMock).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it('redirects to /login with redirect param when no session', async () => {
      getSessionMock.mockResolvedValue({ data: { user: null } })
      const middleware = await loadMiddleware()
      await middleware(createRoute('/settings'))

      expect(navigateToMock).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/settings' },
      })
    })

    it('omits redirect param for root path', async () => {
      getSessionMock.mockResolvedValue({ data: { user: null } })
      const middleware = await loadMiddleware()
      await middleware(createRoute('/'))

      expect(navigateToMock).toHaveBeenCalledWith({
        path: '/login',
        query: undefined,
      })
    })

    it('redirects to /login when getSession throws', async () => {
      getSessionMock.mockRejectedValue(new Error('network error'))
      const middleware = await loadMiddleware()
      await middleware(createRoute('/settings'))

      expect(navigateToMock).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/settings' },
      })
    })
  })

  // --- Offline scenarios ---

  describe('offline', () => {
    beforeEach(() => {
      vi.stubGlobal('navigator', { onLine: false })
    })

    afterEach(() => {
      vi.stubGlobal('navigator', { onLine: true })
    })

    it('skips getSession when offline with cached cookie', async () => {
      hasAuthCookieMock.mockReturnValue(true)
      const middleware = await loadMiddleware()
      const result = await middleware(createRoute('/dashboard'))

      expect(getSessionMock).not.toHaveBeenCalled()
      expect(navigateToMock).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it('redirects /login to /dashboard when offline with cached cookie', async () => {
      hasAuthCookieMock.mockReturnValue(true)
      const middleware = await loadMiddleware()
      await middleware(createRoute('/login'))

      expect(navigateToMock).toHaveBeenCalledWith('/dashboard')
    })

    it('redirects to /login when offline without cached cookie', async () => {
      const middleware = await loadMiddleware()
      await middleware(createRoute('/settings'))

      expect(getSessionMock).not.toHaveBeenCalled()
      expect(navigateToMock).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/settings' },
      })
    })

    it('passes through /login when offline without cached cookie', async () => {
      const middleware = await loadMiddleware()
      const result = await middleware(createRoute('/login'))

      expect(navigateToMock).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })
})
