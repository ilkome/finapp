<script setup lang="ts">
import pkg from '~~/package.json'

import { useDemo } from '~/components/demo/useDemo'
import { showErrorToast } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'

const { session, signInWithGoogle, signInWithPassword, signUp } = useSupabaseAuth()
const logger = createLogger('login')

definePageMeta({
  layout: 'empty',
})

const { locale, t } = useI18n()

useSeoMeta({
  ogTitle: t('login.title'),
  title: t('login.title'),
})

const { generateDemoData, isDemo } = useDemo()
const route = useRoute()
const router = useRouter()

const isLoading = ref(false)
const isSignUp = ref(false)
const email = ref('')
const password = ref('')

// Set right before redirecting to Google, read on return: marks this load as the OAuth callback.
const OAUTH_PENDING_KEY = 'finapp.oauthPending'
const isOauthReturn = ref(false)

async function submit() {
  if (!email.value || !password.value)
    return

  isDemo.value = null
  isLoading.value = true

  try {
    const { error } = isSignUp.value
      ? await signUp(email.value, password.value)
      : await signInWithPassword(email.value, password.value)

    if (error)
      throw error

    // supabase-js has already persisted the session to localStorage by the time
    // signIn/signUp resolves, so the synchronous route gate (hasPersistedSession)
    // passes immediately - no need to mirror the uid anywhere before navigating.
    router.push(getSafeRedirectPath(route.query.redirect))
  }
  catch (e: unknown) {
    logger.error('auth error:', e)
    showErrorToast('login.error')
    isLoading.value = false
  }
}

async function onGoogle() {
  isDemo.value = null
  isLoading.value = true

  try {
    const redirect = getSafeRedirectPath(route.query.redirect)
    const base = `${window.location.origin}/login`
    const redirectTo = redirect === '/dashboard'
      ? base
      : `${base}?redirect=${encodeURIComponent(redirect)}`

    // Survives the full-page redirect to Google and back (detectSessionInUrl can strip ?code= before we read it).
    sessionStorage.setItem(OAUTH_PENDING_KEY, '1')

    const { error } = await signInWithGoogle(redirectTo)
    if (error)
      throw error
    // Success: the browser is already navigating to Google; keep the spinner.
  }
  catch (e: unknown) {
    sessionStorage.removeItem(OAUTH_PENDING_KEY)
    logger.error('google auth error:', e)
    showErrorToast('login.error')
    isLoading.value = false
  }
}

async function openDemo() {
  isDemo.value = 'true'
  await generateDemoData(locale.value)
  router.push(getSafeRedirectPath(route.query.redirect))
}

// If the session never lands (user aborted the Google flow, hit back, or the provider
// errored silently), give up on the spinner instead of hanging forever.
const OAUTH_RETURN_TIMEOUT_MS = 10_000
let oauthTimeout: ReturnType<typeof setTimeout> | undefined

function clearOauthReturn() {
  if (oauthTimeout) {
    clearTimeout(oauthTimeout)
    oauthTimeout = undefined
  }
  sessionStorage.removeItem(OAUTH_PENDING_KEY)
  isOauthReturn.value = false
  isLoading.value = false
}

// Returning from Google: detectSessionInUrl exchanges the ?code= asynchronously; hold the spinner,
// then navigate once the session lands. Denied consent / provider errors come back as ?error=.
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const pending = sessionStorage.getItem(OAUTH_PENDING_KEY) === '1'

  if (params.has('error')) {
    sessionStorage.removeItem(OAUTH_PENDING_KEY)
    logger.error('google auth error:', params.get('error_description') ?? params.get('error'))
    showErrorToast('login.error')
    return
  }

  if (pending || params.has('code')) {
    isOauthReturn.value = true
    isLoading.value = true
    oauthTimeout = setTimeout(() => {
      logger.error('google auth timed out: no session after OAuth return')
      clearOauthReturn()
    }, OAUTH_RETURN_TIMEOUT_MS)
  }
})

onUnmounted(() => {
  if (oauthTimeout)
    clearTimeout(oauthTimeout)
})

watch(session, (next) => {
  if (next && isOauthReturn.value) {
    if (oauthTimeout)
      clearTimeout(oauthTimeout)
    sessionStorage.removeItem(OAUTH_PENDING_KEY)
    router.replace(getSafeRedirectPath(route.query.redirect))
  }
}, { immediate: true })
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
        <UiLogo size="lg" />
        <div class="text-muted pt-1 text-sm">
          {{ t('login.description') }}
        </div>

        <form class="grid min-w-[320px] items-center gap-3 py-14" @submit.prevent="submit">
          <UButton
            block
            color="neutral"
            icon="mdi:google"
            :loading="isLoading"
            size="xl"
            type="button"
            variant="subtle"
            @click="onGoogle"
          >
            {{ t('login.signInWithGoogle') }}
          </UButton>

          <USeparator
            :label="t('login.or')"
            class="!text-muted px-3 pb-3"
          />

          <UInput
            v-model="email"
            autocomplete="email"
            :placeholder="t('login.email')"
            size="xl"
            type="email"
          />
          <UInput
            v-model="password"
            :autocomplete="isSignUp ? 'new-password' : 'current-password'"
            :placeholder="t('login.password')"
            size="xl"
            type="password"
          />

          <UiButtonAccent
            :loading="isLoading"
            rounded
            size="xl"
            type="submit"
          >
            {{ isSignUp ? t('login.signUp') : t('login.signIn') }}
          </UiButtonAccent>

          <UButton
            block
            color="neutral"
            size="md"
            type="button"
            variant="ghost"
            @click="isSignUp = !isSignUp"
          >
            {{ isSignUp ? t('login.haveAccount') : t('login.noAccount') }}
          </UButton>

          <USeparator
            :label="t('login.or')"
            class="!text-muted px-3 pt-3"
          />

          <UiButtonAccent
            rounded
            size="xl"
            type="button"
            variant="ghost"
            @click="openDemo"
          >
            {{ t('login.openDemo') }}
          </UiButtonAccent>
        </form>
      </div>
    </div>

    <div class="flex-center flex-col">
      <AppCopyright />
      <div class="text-muted pt-4 text-xs">
        {{ t('app.version') }} {{ pkg.version }}
      </div>
    </div>
  </div>
</template>
