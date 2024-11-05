import { useDemo } from '~/components/demo/useDemo'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser()
  const localAuthUid = useCookie('finapp.localAuthUid')
  const { isDemo } = useDemo()
  localAuthUid.value = user?.uid || null

  if (isDemo.value && to.path === '/login' && typeof to.query.redirect === 'string') {
    return navigateTo(to.query.redirect)
  }
  else if (isDemo.value && to.path === '/login') {
    return navigateTo('/dashboard')
  }
  else if (isDemo.value && to.path !== '/login') {
    // TODO: keep this to prevent infinite redirect
  }
  else if (!user && to.path !== '/login') {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    })
  }
  else if (user && to.path === '/login') {
    return navigateTo('/dashboard')
  }
})
