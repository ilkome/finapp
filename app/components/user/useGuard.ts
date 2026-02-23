import { useInitApp } from '~/components/app/useInitApp'
import { useUserStore } from '~/components/user/useUserStore'

export function useGuard() {
  const route = useRoute()
  const router = useRouter()

  const userStore = useUserStore()
  const { clearLocalData } = useInitApp()

  onMounted(() => {
    watch(
      () => userStore.currentUser,
      (user, prevUser) => {
        if (user && route.path === '/login') {
          router.push('/dashboard')
        }
        else if (prevUser && !user) {
          if (userStore.isSigningOut)
            return
          clearLocalData()
          router.push('/login')
        }
        else if (user && typeof route.query.redirect === 'string') {
          router.push(getSafeRedirectPath(route.query.redirect))
        }
      },
      { immediate: true },
    )
  })
}
