import { useInitApp } from '~/components/app/useInitApp'

export default defineNuxtPlugin(() => {
  useInitApp().loadData()

  // addRouteMiddleware('auth', (to) => {
  //   const userStore = useUserStore()
  //   if (!userStore.uid && to.name !== 'login')
  //     return navigateTo('/login')
  // }, { global: true })
})
