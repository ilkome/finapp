export default defineNuxtRouteMiddleware(async (to) => {
  const user = await getCurrentUser()
  const localAuthUid = useCookie('finapp.localAuthUid')
  const isDemo = useCookie('finapp.isDemo')
  localAuthUid.value = user?.uid || null

  if (isDemo.value && to.path === '/login' && typeof to.query.redirect === 'string') {
    console.log(1)
    return navigateTo(to.query.redirect)
  }
  else if (isDemo.value && to.path === '/login') {
    console.log(2)
    return navigateTo('/dashboard')
  }
  else if (isDemo.value && to.path !== '/login') {
    console.log(3)
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
