import { useDemo } from '~/components/demo/useDemo'
import { clearAuthCookie, hasAuthCookie, isSessionInitialized, setAuthCookie, setSessionInitialized } from '~/composables/useAuthCookie'
import { createLogger } from '~/utils/logger'

const logger = createLogger('auth/middleware')

export default defineNuxtRouteMiddleware(async (to) => {
  if (to.query.ott && to.path !== '/auth/callback') {
    return navigateTo({
      path: '/auth/callback',
      query: { ott: to.query.ott },
    }, { replace: true })
  }

  if (to.path === '/auth/callback')
    return

  const { isDemo } = useDemo()

  if (isDemo.value) {
    if (to.path === '/login') {
      return navigateTo(getSafeRedirectPath(to.query.redirect))
    }
    return
  }

  const authClient = useAuth()
  const isLoginPage = to.path === '/login'

  if (hasAuthCookie()) {
    if (!isSessionInitialized() && navigator.onLine) {
      setSessionInitialized(true)
      authClient.getSession()
        .then((session) => {
          const user = session.data?.user || null
          if (!user) {
            logger.error('Background getSession: session expired, redirecting to login')
            setSessionInitialized(false)
            clearAuthCookie()
            navigateTo('/login')
          }
        })
        .catch((error) => {
          logger.error('Background getSession failed:', error)
          setSessionInitialized(false)
        })
    }

    if (isLoginPage) {
      return navigateTo('/dashboard')
    }
    return
  }

  if (isLoginPage)
    return

  if (!navigator.onLine) {
    const redirect = to.fullPath === '/' ? undefined : { redirect: to.fullPath }
    return navigateTo({
      path: '/login',
      query: redirect,
    })
  }

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
