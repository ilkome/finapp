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

    const siteUrl = config.public.convexSiteUrl as string

    const fetchConvexToken = async (forceRefreshToken: boolean) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      try {
        // Use raw fetch with explicit cookie forwarding — bypasses
        // authClient.$fetch pipeline to isolate the issue.
        const raw = localStorage.getItem('better-auth_cookie')
        if (!raw)
          return null

        const parsed = JSON.parse(raw) as Record<string, { value?: string }>
        const cookieStr = Object.entries(parsed)
          .filter(([, val]) => val?.value)
          .map(([key, val]) => `${key}=${val!.value}`)
          .join('; ')

        if (!cookieStr)
          return null

        const url = new URL('/api/auth/convex/token', siteUrl)
        // Prevent session refresh during token fetch — the convex plugin's
        // before hook only sets disableRefresh for /get-session, not /convex/token.
        // Without this, getSession() inside sessionMiddleware may attempt a
        // session refresh that fails in cross-domain context → 401.
        url.searchParams.set('disableRefresh', 'true')
        if (forceRefreshToken)
          url.searchParams.set('forceRefresh', 'true')

        const res = await fetch(url.toString(), {
          credentials: 'omit',
          headers: {
            'Better-Auth-Cookie': cookieStr,
            'Origin': window.location.origin,
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
