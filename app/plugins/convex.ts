import { createConvexClient } from '~~/services/convex/client'

import { clearAuthCookie, hasAuthCookie } from '~/composables/useAuthCookie'
import { createLogger } from '~/utils/logger'

const logger = createLogger('convex')

export default defineNuxtPlugin(() => {
  // Request persistent storage to protect IndexedDB data from automatic
  // eviction on iOS Safari and Android Chrome when device is low on space.
  navigator.storage?.persist?.()

  const config = useRuntimeConfig()
  const convexUrl = config.public.convexUrl as string

  if (!convexUrl)
    throw new Error('CONVEX_URL is not set in environment variables')

  const client = createConvexClient(convexUrl)
  const authClient = useAuth()
  const session = authClient.useSession()

  let authReadyResolve: (() => void) | null = null
  let authReadyPromise: Promise<void> | null = null

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
    // Eagerly fetch token so authReadyPromise resolves immediately,
    // rather than waiting for the Convex client to schedule fetchToken.
    fetchToken({ forceRefreshToken: false })
  }

  let authSet = false
  if (hasAuthCookie() && navigator.onLine) {
    startAuth()
    authSet = true
  }

  // Ignore isPending and error states to avoid logging out on network failures.
  watch(
    () => {
      const s = session.value
      if (!s || s.isPending)
        return undefined
      if (s.error)
        return undefined
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

  window.addEventListener('online', () => {
    if (hasAuthCookie()) {
      startAuth()
      authSet = true
    }
  })

  function ensureConvexAuth() {
    if (hasAuthCookie()) {
      startAuth()
      authSet = true
    }
  }

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
