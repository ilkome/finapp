export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser()
  const localAuthUid = useCookie('finapp.localAuthUid')
  localAuthUid.value = user?.uid || null

  if (!user && to.path !== '/login') {
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
