<script setup lang="ts">
import { useDemo } from '~/components/demo/useDemo'
import { showErrorToast } from '~/composables/useStoreSync'

const { signIn } = useAuth()
const logger = createLogger('login')

definePageMeta({
  layout: 'empty',
})

const { locale, t } = useI18n()

useSeoMeta({
  ogTitle: t('login.title'),
  title: t('login.title'),
})

const { generateDemoData } = useDemo()
const route = useRoute()
const router = useRouter()
const { isDemo } = useDemo()

const isLoading = ref(false)

async function signInWithGoogle() {
  isDemo.value = null
  isLoading.value = true

  // Unregister service workers before OAuth flow.
  // A stale SW with navigateFallback intercepts the callback page navigation
  // at the network level and serves cached content instead of the real page.
  // Our OTT verification code never runs → auth fails on re-login.
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const reg of registrations)
      await reg.unregister()
  }

  // Remember where user wanted to go, so callback page can redirect back.
  // Using localStorage (synchronous) instead of cookie — cookie may not flush
  // before signIn.social() triggers full-page navigation to Google.
  const redirectTo = getSafeRedirectPath(route.query.redirect)
  localStorage.setItem('finapp.authRedirect', redirectTo)

  // Clear stale cross-domain cookies before initiating OAuth.
  // After signOut, background responses (getSession, atom refetch) can race
  // with localStorage.removeItem and re-write stale cookies. The stale
  // __Secure-better-auth.state confuses the OAuth flow.
  localStorage.removeItem('better-auth_cookie')
  localStorage.removeItem('better-auth_session_data')

  try {
    const result = await signIn.social({ callbackURL: `${window.location.origin}/auth/callback`, provider: 'google' })

    // crossDomainClient returns {url, redirect: true} instead of auto-redirecting.
    // Manually redirect to the Google OAuth URL.
    if (result.data?.url) {
      window.location.href = result.data.url
    }
  }
  catch (e: unknown) {
    logger.error('signIn.social error:', e)
    showErrorToast('login.error')
    isLoading.value = false
  }
}

async function openDemo() {
  isDemo.value = 'true'
  await generateDemoData(locale.value)
  router.push(getSafeRedirectPath(route.query.redirect))
}
</script>

<template>
  <div class="mx-auto grid size-full h-dvh max-w-xl grid-rows-[auto_1fr_auto] px-2 py-3">
    <div class="flex items-center justify-end gap-3">
      <LocaleSwitcher />
      <ThemeSwitcher />
      <ThemePicker />
      <UTooltip text="GitHub">
        <UButton
          aria-label="GitHub"
          class="text-muted"
          color="neutral"
          icon="mdi:github"
          size="lg"
          square
          target="_blank"
          to="https://github.com/ilkome/finapp"
          variant="ghost"
        />
      </UTooltip>
    </div>

    <div
      class="grid h-full items-center gap-8 overflow-hidden overflow-y-auto px-3 py-4"
    >
      <div class="flex flex-col items-center justify-center pb-10">
        <UiLogo class="pb-0 !text-6xl !font-extrabold" />
        <div class="text-muted pt-1 text-sm">
          {{ t('login.description') }}
        </div>

        <div class="grid min-w-[320px] items-center gap-2 py-14">
          <UiButtonAccent
            :loading="isLoading"
            rounded
            size="xl"
            @click="signInWithGoogle"
          >
            {{ t('loginWithGoogle') }}
          </UiButtonAccent>

          <USeparator
            :label="t('login.or')"
            class="!text-muted px-3 pt-3"
          />

          <UiButtonAccent
            rounded
            size="xl"
            variant="ghost"
            @click="openDemo"
          >
            {{ t('login.openDemo') }}
          </UiButtonAccent>
        </div>
      </div>
    </div>

    <div class="flex-center">
      <AppCopyright />
    </div>
  </div>
</template>
