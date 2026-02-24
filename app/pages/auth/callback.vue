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

  // Guard against double callback (e.g., service worker replaying the navigation).
  // The first callback clears localStorage and verifies the OTT. If a second callback
  // fires with the same OTT, skip it — the first one already handled auth and started
  // a hard navigation. Without this guard, the second callback would clear the cookies
  // written by the first one, leaving Convex unable to authenticate.
  const ottKey = 'finapp.ottProcessing'
  if (sessionStorage.getItem(ottKey) === ott) {
    return
  }
  sessionStorage.setItem(ottKey, ott)

  const authClient = useAuth()

  // Clear stale cookies left by signIn.social (e.g., empty convex_jwt, state).
  // OTT verify's onSuccess hook will write fresh cookies from the server response.
  localStorage.removeItem('better-auth_cookie')
  localStorage.removeItem('better-auth_session_data')

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
      sessionStorage.removeItem(ottKey)

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
  sessionStorage.removeItem(ottKey)
  navigateTo('/login', { replace: true })
})
</script>

<template>
  <div class="flex-center h-dvh">
    <UIcon name="lucide:loader-circle" class="text-muted size-6 animate-spin" />
  </div>
</template>
