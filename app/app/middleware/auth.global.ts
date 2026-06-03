import { useDemo } from '~/components/demo/useDemo'
import { hasPersistedSession } from '~/composables/useAuthSession'

// The persisted Supabase session (localStorage) is the synchronous "is logged in" gate.
// Validity is verified asynchronously (autoRefreshToken + useGuard), so the middleware
// only needs this optimistic check.
export default defineNuxtRouteMiddleware((to) => {
  const { isDemo } = useDemo()
  const isLoginPage = to.path === '/login'

  if (isDemo.value) {
    if (isLoginPage)
      return navigateTo(getSafeRedirectPath(to.query.redirect))
    return
  }

  if (hasPersistedSession()) {
    if (isLoginPage)
      return navigateTo('/dashboard')
    return
  }

  if (isLoginPage)
    return

  const redirect = to.fullPath === '/' ? undefined : { redirect: to.fullPath }
  return navigateTo({ path: '/login', query: redirect })
})
