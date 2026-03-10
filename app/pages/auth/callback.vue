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

  // Service worker can replay callback navigation after the first run already
  // succeeded. If auth cookie is set, the first callback already completed —
  // skip verify and redirect to the app.
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

    // crossDomainClient's onSuccess hook already processed Set-Better-Auth-Cookie
    // from the OTT verify response and wrote the SIGNED session token to localStorage.
    // Call getSession WITHOUT Authorization header — let the cross-domain client
    // send the signed token via Better-Auth-Cookie. Using Authorization: Bearer
    // with the raw (unsigned) token causes the server to skip cookie injection
    // and the bearer plugin can't verify an unsigned token.
    const session = await authClient.getSession()

    if (session.data?.user) {
      const uid = session.data.user.id

      setAuthCookie(uid)

      const redirectTo = getSafeRedirectPath(localStorage.getItem('finapp.authRedirect'))
      localStorage.removeItem('finapp.authRedirect')

      // SPA navigation — the Convex plugin's session watch detects the
      // auth transition and calls client.setAuth(fetchToken) automatically.
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
