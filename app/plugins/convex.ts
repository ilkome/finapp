import type { ConvexClient, ConvexHttpClient } from 'convex/browser'

import { createConvexClient, createConvexHttpClient } from '~~/services/convex/client'

import { hasAuthCookie } from '~/composables/useAuthCookie'
import { createLogger } from '~/utils/logger'

const logger = createLogger('convex')

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const convexUrl = config.public.convexUrl as string

  if (!convexUrl) {
    if (import.meta.prerender)
      return
    throw new Error('CONVEX_URL is not set in environment variables')
  }

  let convex: ConvexClient | ConvexHttpClient
  let convexHttp: ConvexHttpClient

  if (import.meta.server) {
    const httpClient = createConvexHttpClient(convexUrl)
    convex = httpClient
    convexHttp = httpClient
  }
  else {
    const client = createConvexClient(convexUrl)
    const authClient = useAuth()
    const session = authClient.useSession()

    /**
     * Read the signed session token from cross-domain client's localStorage.
     * We send it as Authorization: Bearer to bypass the Better-Auth-Cookie
     * flow which fails for /convex/token (cross-domain before-hook doesn't
     * inject cookies into the Cookie header reliably for this endpoint).
     */
    function getSessionToken(): string | null {
      try {
        const raw = localStorage.getItem('better-auth_cookie')
        if (!raw)
          return null
        const cookies = JSON.parse(raw) as Record<string, { value?: string }>
        for (const [key, val] of Object.entries(cookies)) {
          if (key.includes('session_token') && val?.value) {
            return val.value
          }
        }
        return null
      }
      catch {
        return null
      }
    }

    const fetchConvexToken = async (forceRefreshToken: boolean) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      try {
        const sessionToken = getSessionToken()
        const { data } = await authClient.$fetch<{ token: string }>('/convex/token', {
          headers: sessionToken ? { Authorization: `Bearer ${sessionToken}` } : undefined,
          method: 'GET',
          query: forceRefreshToken ? { forceRefresh: 'true' } : undefined,
          signal: controller.signal,
        })
        return data?.token ?? null
      }
      finally {
        clearTimeout(timeout)
      }
    }

    const fetchToken = async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!hasAuthCookie())
        return null

      try {
        return await fetchConvexToken(forceRefreshToken)
      }
      catch (error) {
        logger.error('fetchToken failed, retrying:', error)
        try {
          await new Promise(r => setTimeout(r, 1000))
          return await fetchConvexToken(forceRefreshToken)
        }
        catch {
          logger.error('fetchToken retry failed')
          return null
        }
      }
    }

    // Only set auth when user is logged in to avoid 401 in console
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
        }
      },
    )

    convex = client
    convexHttp = createConvexHttpClient(convexUrl)
  }

  return {
    provide: {
      convex,
      convexHttp,
    },
  }
})
