<script setup lang="ts">
import { hasAuthCookie } from '~/composables/useAuthCookie'
import { showErrorToast } from '~/composables/useStoreSync'

definePageMeta({
  layout: 'empty',
})

const route = useRoute()
const logger = createLogger('auth/callback')

onMounted(async () => {
  const ott = route.query.ott as string
  if (!ott) {
    navigateTo('/login', { replace: true })
    return
  }

  if (hasAuthCookie()) {
    const redirectTo = getSafeRedirectPath(localStorage.getItem('finapp.authRedirect'))
    localStorage.removeItem('finapp.authRedirect')
    navigateTo(redirectTo, { replace: true })
    return
  }

  const authClient = useAuth()

  try {
    const result = await authClient.$fetch<{
      session: { expiresAt: number, token: string }
    }>('/cross-domain/one-time-token/verify', {
      body: { token: ott },
      method: 'POST',
    })

    if (!result.data?.session?.token) {
      navigateTo('/login', { replace: true })
      return
    }

    const session = await authClient.getSession()

    if (session.data?.user) {
      const uid = session.data.user.id

      setAuthCookie(uid)

      const { $ensureConvexAuth } = useNuxtApp()
      ;($ensureConvexAuth as () => void)()

      const redirectTo = getSafeRedirectPath(localStorage.getItem('finapp.authRedirect'))
      localStorage.removeItem('finapp.authRedirect')

      navigateTo(redirectTo, { replace: true })
      return
    }
  }
  catch (error: unknown) {
    logger.error('Error:', error)
    showErrorToast('login.error')
  }

  localStorage.removeItem('finapp.authRedirect')
  navigateTo('/login', { replace: true })
})
</script>

<template>
  <div class="flex-center h-dvh">
    <UIcon name="lucide:loader-circle" class="text-muted size-6 animate-spin" />
  </div>
</template>
