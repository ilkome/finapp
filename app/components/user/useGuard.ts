import { useInitApp } from '~/components/app/useInitApp'
import { useUserStore } from '~/components/user/useUserStore'

export function useGuard() {
  const route = useRoute()
  const router = useRouter()

  const userStore = useUserStore()
  const localAuthUid = useCookie('finapp.localAuthUid')
  const { clearLocalData } = useInitApp()

  onMounted(() => {
    watch(() => userStore.currentUser, (user, prevUser) => {
      if (user?.uid && user?.uid !== localAuthUid.value) {
        clearLocalData()
      }

      if (user && route.path === '/login') {
        router.push('/dashboard')
      }
      else if (user && route.path === '/login') {
        router.push('/dashboard')
      }
      else if (prevUser && !user) {
        router.push('/login')
      }
      else if (user && typeof route.query.redirect === 'string') {
        router.push(route.query.redirect)
      }
    }, { immediate: true })
  })
}
