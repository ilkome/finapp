<script setup lang="ts">
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

  const authClient = useAuth()

  // Do NOT clear localStorage here — the cross-domain client's onSuccess hook
  // will overwrite stale cookies with fresh ones from the verify response.
  // Clearing here is dangerous because service worker can replay the callback
  // navigation, and the second run would delete cookies written by the first.

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

      // Hard navigation creates a fresh app with the cookie already set.
      // This ensures Convex plugin initializes with auth from the start.
      window.location.href = redirectTo
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
