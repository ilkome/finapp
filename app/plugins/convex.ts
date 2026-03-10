import { createConvexClient } from '~~/services/convex/client'

import { clearAuthCookie, hasAuthCookie } from '~/composables/useAuthCookie'
import { createLogger } from '~/utils/logger'

const logger = createLogger('convex')

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const convexUrl = config.public.convexUrl as string

  if (!convexUrl)
    throw new Error('CONVEX_URL is not set in environment variables')

  const client = createConvexClient(convexUrl)
  const authClient = useAuth()
  const session = authClient.useSession()

  // Resolves when the first token fetch completes (success or failure).
  // Consumers (loadDataFromDB) await this before issuing Convex queries
  // to ensure the WebSocket is authenticated.
  let authReadyResolve: (() => void) | null = null
  let authReadyPromise: Promise<void> | null = null

  // Fetch a Convex JWT via Better Auth's /convex/token endpoint.
  // The crossDomainClient plugin automatically handles cookie forwarding
  // (reads localStorage['better-auth_cookie'] → sends as Better-Auth-Cookie header).
  const fetchToken = async (_opts: { forceRefreshToken: boolean }) => {
    if (!hasAuthCookie() || !navigator.onLine) {
      authReadyResolve?.()
      return null
    }

    try {
      const { data } = await authClient.convex.token()
      const token = data?.token || null
      authReadyResolve?.()
      return token
    }
    catch (error) {
      if (navigator.onLine)
        logger.error('fetchConvexToken error:', error)
      authReadyResolve?.()
      return null
    }
  }

  function startAuth() {
    authReadyPromise = new Promise<void>((resolve) => {
      authReadyResolve = resolve
    })
    client.setAuth(fetchToken)
  }

  // Eagerly set auth when the user has a cached auth cookie.
  // hasAuthCookie() is a fast synchronous document.cookie check that lets
  // us call setAuth immediately, which starts token fetching in parallel
  // with the background session resolution.
  let authSet = false
  if (hasAuthCookie() && navigator.onLine) {
    startAuth()
    authSet = true
  }

  // Watch session state for auth transitions.
  // Only act on definitive results: user found → set auth, user explicitly
  // absent (no error) → clear auth. Network errors are ignored to prevent
  // logging out users who are offline or have flaky connections.
  watch(
    () => {
      const s = session.value
      if (!s || s.isPending)
        return undefined // still loading
      if (s.error)
        return undefined // network/fetch error — not a definitive result
      return s.data?.user?.id ?? null
    },
    (resolvedUid) => {
      if (resolvedUid === undefined)
        return
      if (resolvedUid) {
        if (!authSet) {
          startAuth()
          authSet = true
        }
      }
      else {
        client.client.clearAuth()
        authSet = false
        clearAuthCookie()
      }
    },
  )

  // Re-authenticate when coming back online so that loadDataFromDB()
  // (which awaits waitForConvexAuth) waits for a fresh token.
  window.addEventListener('online', () => {
    if (hasAuthCookie()) {
      startAuth()
      authSet = true
    }
  })

  // Called from callback page after login to ensure Convex auth is set
  // BEFORE SPA navigation to dashboard. Without this, loadDataFromDB()
  // fires queries before the plugin's session watch triggers setAuth.
  function ensureConvexAuth() {
    if (hasAuthCookie()) {
      startAuth()
      authSet = true
    }
  }

  // Returns a promise that resolves once the Convex auth token has been
  // fetched (or immediately if no auth is in progress).
  function waitForAuth(): Promise<void> {
    return authReadyPromise ?? Promise.resolve()
  }

  return {
    provide: {
      convex: client,
      ensureConvexAuth,
      waitForConvexAuth: waitForAuth,
    },
  }
})
