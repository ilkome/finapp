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

    const fetchConvexToken = async (forceRefreshToken: boolean) => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      try {
        const { data } = await authClient.$fetch<{ token: string }>('/convex/token', {
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
      if (!hasAuthCookie()) {
        authClient.getSession().catch(() => {})
        return null
      }

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
          authClient.getSession().catch(() => {})
          return null
        }
      }
    }

    // Only set auth when user is logged in to avoid 401 in console
    if (hasAuthCookie())
      client.setAuth(fetchToken)

    // Watch session state for auth transitions
    watch(
      () => session.value?.isPending === false
        ? (session.value?.data?.user?.id ?? null)
        : undefined,
      (resolvedUid) => {
        if (resolvedUid === undefined)
          return // still pending
        if (resolvedUid)
          client.setAuth(fetchToken)
        else client.client.clearAuth()
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
