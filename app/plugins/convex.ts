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

        // disableRefresh is set server-side by the before hook in convex/auth.ts
        // for /convex/token — no need to set it here.
        const url = new URL('/api/auth/convex/token', siteUrl)
        if (forceRefreshToken)
          url.searchParams.set('forceRefresh', 'true')

        const res = await fetch(url, {
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

      return fetchConvexToken(forceRefreshToken)
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
