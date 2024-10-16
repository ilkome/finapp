import { useInitApp } from '~/components/app/useInitApp'

export function useGuard() {
  const route = useRoute()
  const router = useRouter()
  const user = useCurrentUser()
  const localAuthUid = useCookie('finapp.localAuthUid')
  const { clearLocalData } = useInitApp()

  onMounted(() => {
    watch(user, (user, prevUser) => {
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
