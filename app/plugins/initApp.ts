import { useInitApp } from '~/components/app/useInitApp'
import { useUserStore } from '~/components/user/useUser'

export default defineNuxtPlugin(async () => {
  const { loadFromCache, loadFromDB } = useInitApp()
  await loadFromCache()
  loadFromDB()

  addRouteMiddleware('auth', (to) => {
    const userStore = useUserStore()
    if (!userStore.uid && to.name !== 'login')
      return navigateTo('/login')
  }, { global: true })
})
