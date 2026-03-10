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

  const siteUrl = config.public.convexSiteUrl as string

  const fetchConvexToken = async (forceRefreshToken: boolean) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
      // Use raw fetch with explicit cookie forwarding — cross-domain
      // client stores cookies in localStorage, not document.cookie.
      const raw = localStorage.getItem('better-auth_cookie')
      if (!raw)
        return null

      let parsed: Record<string, { value?: string }>
      try {
        parsed = JSON.parse(raw)
      }
      catch {
        return null
      }

      if (!parsed || typeof parsed !== 'object')
        return null
      const cookieStr = Object.entries(parsed)
        .filter(([, val]) => val?.value)
        .map(([key, val]) => `${key}=${val!.value}`)
        .join('; ')

      if (!cookieStr)
        return null

      // disableRefresh is set by the before hook in convex/auth.ts for /convex/token.
      const url = new URL('/api/auth/convex/token', siteUrl)
      if (forceRefreshToken)
        url.searchParams.set('forceRefresh', 'true')

      const res = await fetch(url, {
        credentials: 'omit',
        headers: {
          'Better-Auth-Cookie': cookieStr,
        },
        method: 'GET',
        signal: controller.signal,
      })

      if (!res.ok) {
        logger.error(`convex/token ${res.status}`, { cookieKeys: Object.keys(parsed), hasCookie: !!cookieStr })
        return null
      }

      const data = await res.json()
      return data?.token ?? null
    }
    catch (error) {
      logger.error('fetchConvexToken error:', error)
      return null
    }
    finally {
      clearTimeout(timeout)
    }
  }

  const fetchToken = async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
    if (!hasAuthCookie())
      return null

    return fetchConvexToken(forceRefreshToken)
  }

  // Eagerly set auth when the user has a cached auth cookie.
  //
  // This is NOT SSR heritage — it is required for SPA mode too.
  // The auth middleware calls getSession() in the background (non-blocking),
  // so the useSession() reactive ref is still pending when stores start
  // querying Convex in default.vue's useAsyncData. Without this eager
  // setAuth, those queries would fire with no auth token → 401 errors.
  //
  // hasAuthCookie() is a fast synchronous document.cookie check that lets
  // us call setAuth immediately, which starts token fetching in parallel
  // with the background session resolution.
  let authSet = false
  if (hasAuthCookie()) {
    client.setAuth(fetchToken)
    authSet = true
  }

  // Watch session state for auth transitions
  watch(
    () => session.value?.isPending === false
      ? (session.value?.data?.user?.id ?? null)
      : undefined,
    (resolvedUid) => {
      if (resolvedUid === undefined)
        return // still pending
      if (resolvedUid) {
        // Only call setAuth on actual transition (login), not on every session refresh
        if (!authSet) {
          client.setAuth(fetchToken)
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

  return {
    provide: {
      convex: client,
    },
  }
})
