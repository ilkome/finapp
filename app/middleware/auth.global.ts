import { useDemo } from '~/components/demo/useDemo'
import { clearAuthCookie, hasAuthCookie, setAuthCookie, useAuthCookieSSR } from '~/composables/useAuthCookie'
import { createLogger } from '~/utils/logger'

const logger = createLogger('auth/middleware')

// Track whether we've already initialized the cross-domain session
// to avoid calling getSession() on every navigation (which triggers
// $sessionSignal → useSession refetch → get-session → signal → loop)
let sessionInitialized = false

export default defineNuxtRouteMiddleware(async (to) => {
  // Skip auth during static prerender — no session context available
  if (import.meta.prerender)
    return

  // OTT can arrive on any route (callbackURL is not always preserved).
  // Redirect to /auth/callback which handles OTT verification on the client.
  if (to.query.ott && to.path !== '/auth/callback') {
    return navigateTo({
      path: '/auth/callback',
      query: { ott: to.query.ott },
    }, { replace: true })
  }

  // Auth callback page handles OTT verification — skip all auth checks
  if (to.path === '/auth/callback')
    return

  const { isDemo } = useDemo()

  // Handle demo mode routing
  if (isDemo.value) {
    if (to.path === '/login') {
      return navigateTo(getSafeRedirectPath(to.query.redirect))
    }
    return
  }

  // SSR: use cached cookie to avoid flash of login page
  if (import.meta.server) {
    const ssrCookie = useAuthCookieSSR()
    const isLoginPage = to.path === '/login'
    const hasCachedAuth = !!ssrCookie.value

    if (!hasCachedAuth && !isLoginPage) {
      const redirect = to.fullPath === '/' ? undefined : { redirect: to.fullPath }
      return navigateTo({
        path: '/login',
        query: redirect,
      })
    }
    if (hasCachedAuth && isLoginPage) {
      return navigateTo('/dashboard')
    }
    return
  }

  // Client: verify auth with Better Auth
  const authClient = useAuth()
  const isLoginPage = to.path === '/login'

  // Has cached auth: let user through immediately, initialize session in background.
  // The getSession() call is needed once to establish the cross-domain session
  // so that useSession() reactive ref updates in the app.
  // Only call once per page load — repeated calls trigger $sessionSignal loop
  // in the cross-domain client (each response sets a cookie → signal → refetch).
  if (hasAuthCookie()) {
    if (!sessionInitialized) {
      sessionInitialized = true
      authClient.getSession()
        .then((session) => {
          const user = session.data?.user || null
          if (!user) {
            logger.error('Background getSession: session expired, redirecting to login')
            clearAuthCookie()
            navigateTo('/login')
          }
        })
        .catch((error) => {
          logger.error('Background getSession failed:', error)
          sessionInitialized = false
        })
    }

    if (isLoginPage) {
      return navigateTo('/dashboard')
    }
    return
  }

  // No cached auth on login page — nothing to verify, let user through.
  if (isLoginPage)
    return

  // No cached auth: must verify (blocking)
  try {
    const session = await authClient.getSession()
    const user = session.data?.user || null

    if (user) {
      setAuthCookie(user.id)
      return
    }
  }
  catch (error) {
    logger.error('getSession failed (no cached auth):', error)
  }

  const redirect = to.fullPath === '/' ? undefined : { redirect: to.fullPath }
  return navigateTo({
    path: '/login',
    query: redirect,
  })
})
