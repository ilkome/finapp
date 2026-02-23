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
    // from the OTT verify response and wrote cookies to localStorage (including
    // convex_jwt and session_token). Only add session_token if it's missing —
    // don't overwrite the entire localStorage as that would wipe convex_jwt.
    const cookieKey = 'better-auth_cookie'
    let afterOtt: Record<string, { expires?: string, value?: string }> = {}
    try {
      afterOtt = JSON.parse(localStorage.getItem(cookieKey) || '{}')
    }
    catch {
      localStorage.removeItem(cookieKey)
    }

    if (!afterOtt['__Secure-better-auth.session_token']?.value) {
      afterOtt['__Secure-better-auth.session_token'] = {
        expires: new Date(result.data.session.expiresAt).toISOString(),
        value: result.data.session.token,
      }
      localStorage.setItem(cookieKey, JSON.stringify(afterOtt))
    }

    // Call getSession with Authorization header first.
    // crossDomainClient's onSuccess hook will process Set-Better-Auth-Cookie
    // from the response and update localStorage with server-issued cookies.
    // Do NOT call $store.notify before this — it triggers a background refetch
    // that races with this call and can overwrite localStorage with empty values.
    const session = await authClient.getSession({
      fetchOptions: {
        headers: { Authorization: `Bearer ${result.data.session.token}` },
      },
    })

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
