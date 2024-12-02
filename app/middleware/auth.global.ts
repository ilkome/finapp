import { useDemo } from '~/components/demo/useDemo'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser()
  const localAuthUid = useCookie('finapp.localAuthUid')
  const { isDemo } = useDemo()

  // Update local auth UID
  localAuthUid.value = user?.uid || null

  // Handle demo mode routing
  if (isDemo.value) {
    if (to.path === '/login') {
      const redirectPath = typeof to.query.redirect === 'string'
        ? to.query.redirect
        : '/dashboard'
      return navigateTo(redirectPath)
    }
    return // Allow access to all routes in demo mode
  }

  // Handle regular auth routing
  const isLoginPage = to.path === '/login'
  const isAuthenticated = !!user

  if (!isAuthenticated && !isLoginPage) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  if (isAuthenticated && isLoginPage) {
    return navigateTo('/dashboard')
  }
})
