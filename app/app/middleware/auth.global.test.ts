import { beforeEach, describe, expect, it, vi } from 'vitest'

const { hasPersistedSessionMock, isDemoRef, navigateToMock } = vi.hoisted(() => ({
  hasPersistedSessionMock: vi.fn(() => false),
  isDemoRef: { value: false },
  navigateToMock: vi.fn(),
}))

vi.mock('~/components/demo/useDemo', () => ({
  useDemo: () => ({ isDemo: isDemoRef }),
}))

vi.mock('~/composables/useAuthSession', () => ({
  hasPersistedSession: hasPersistedSessionMock,
}))

vi.stubGlobal('defineNuxtRouteMiddleware', (fn: any) => fn)
vi.stubGlobal('navigateTo', navigateToMock)
vi.stubGlobal('getSafeRedirectPath', (value: unknown) => {
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//'))
    return value
  return '/dashboard'
})

function createRoute(path: string, query: Record<string, string> = {}) {
  const qs = Object.entries(query).map(([k, v]) => `${k}=${v}`).join('&')
  return { fullPath: qs ? `${path}?${qs}` : path, path, query }
}

type MiddlewareFn = (to: ReturnType<typeof createRoute>) => unknown

let middleware: MiddlewareFn

async function loadMiddleware(): Promise<MiddlewareFn> {
  if (!middleware) {
    const mod = await import('~/middleware/auth.global')
    middleware = mod.default as MiddlewareFn
  }
  return middleware
}

describe('auth.global middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isDemoRef.value = false
    hasPersistedSessionMock.mockReturnValue(false)
  })

  describe('demo mode', () => {
    beforeEach(() => {
      isDemoRef.value = true
    })

    it('redirects /login to the redirect query path', async () => {
      const middleware = await loadMiddleware()
      middleware(createRoute('/login', { redirect: '/settings' }))
      expect(navigateToMock).toHaveBeenCalledWith('/settings')
    })

    it('redirects /login to /dashboard without redirect param', async () => {
      const middleware = await loadMiddleware()
      middleware(createRoute('/login'))
      expect(navigateToMock).toHaveBeenCalledWith('/dashboard')
    })

    it('passes through non-login routes', async () => {
      const middleware = await loadMiddleware()
      const result = middleware(createRoute('/dashboard'))
      expect(navigateToMock).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })
  })

  describe('with persisted session', () => {
    beforeEach(() => {
      hasPersistedSessionMock.mockReturnValue(true)
    })

    it('passes through protected routes', async () => {
      const middleware = await loadMiddleware()
      const result = middleware(createRoute('/dashboard'))
      expect(result).toBeUndefined()
      expect(navigateToMock).not.toHaveBeenCalled()
    })

    it('redirects /login to /dashboard', async () => {
      const middleware = await loadMiddleware()
      middleware(createRoute('/login'))
      expect(navigateToMock).toHaveBeenCalledWith('/dashboard')
    })
  })

  describe('no persisted session', () => {
    it('passes through /login', async () => {
      const middleware = await loadMiddleware()
      const result = middleware(createRoute('/login'))
      expect(navigateToMock).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it('redirects to /login with redirect param for a protected route', async () => {
      const middleware = await loadMiddleware()
      middleware(createRoute('/settings'))
      expect(navigateToMock).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/settings' },
      })
    })

    it('omits redirect param for root path', async () => {
      const middleware = await loadMiddleware()
      middleware(createRoute('/'))
      expect(navigateToMock).toHaveBeenCalledWith({
        path: '/login',
        query: undefined,
      })
    })
  })
})
