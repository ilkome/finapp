import { useInitApp } from '~/components/app/useInitApp'

export default defineNuxtPlugin(() => {
  const { init } = useInitApp()
  init()

  // addRouteMiddleware('auth', (to) => {
  //   const userStore = useUserStore()
  //   if (!userStore.uid && to.name !== 'login')
  //     return navigateTo('/login')
  // }, { global: true })
})
