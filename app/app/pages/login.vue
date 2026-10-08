<script setup lang="ts">
import { useDemo } from '~/components/demo/useDemo'
import { useFeature } from '~/composables/useFeatures'
import { showErrorToast } from '~/composables/useStoreSync'
import { useSupabase, useSupabaseAuth } from '~/composables/useSupabase'

const { sendEmailOtp, session, signInWithGoogle, verifyEmailOtp } = useSupabaseAuth()
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
const isEmailSignIn = useFeature('emailSignIn')

// Set right before redirecting to Google, read on return: marks this load as the OAuth callback.
const OAUTH_PENDING_KEY = 'finapp.oauthPending'

// Matches `otp_length` in supabase/config.toml and the dashboard.
const OTP_LENGTH = 6
// Supabase rejects a second email to the same address within 60s by default.
const RESEND_COOLDOWN_S = 60

const email = ref('')
const sentTo = ref<string | null>(null)
const lastSentTo = ref<string | null>(null)
const otp = ref<number[]>([])
const { remaining: resendIn, start: startResendCooldown } = useCountdown(RESEND_COOLDOWN_S)

function buildRedirectTo() {
  const redirect = getSafeRedirectPath(route.query.redirect)
  const base = `${window.location.origin}/login`
  return redirect === '/dashboard'
    ? base
    : `${base}?redirect=${encodeURIComponent(redirect)}`
}

async function onGoogle() {
  isDemo.value = null
  isLoading.value = true

  try {
    // Survives the full-page redirect to Google and back (detectSessionInUrl can strip ?code= before we read it).
    sessionStorage.setItem(OAUTH_PENDING_KEY, '1')

    const { error } = await signInWithGoogle(buildRedirectTo())
    if (error)
      throw error
  }
  catch (e: unknown) {
    sessionStorage.removeItem(OAUTH_PENDING_KEY)
    logger.error('google auth error:', e)
    showErrorToast('login.error')
    isLoading.value = false
  }
}

async function onSendEmail() {
  const value = email.value.trim()
  if (!value || isLoading.value)
    return

  // The code from the last email is still valid: reopen the code step instead of hitting
  // Supabase's per-address resend limit.
  if (value === lastSentTo.value && resendIn.value > 0) {
    sentTo.value = value
    return
  }

  isDemo.value = null
  isLoading.value = true
  try {
    const { error } = await sendEmailOtp(value, buildRedirectTo(), locale.value)
    // 429 = an email went to this address moments ago (e.g. before a reload): its code still works.
    if (error && error.status !== 429)
      throw error
    sentTo.value = value
    lastSentTo.value = value
    otp.value = []
    startResendCooldown()
  }
  catch (e: unknown) {
    logger.error('email otp send error:', e)
    showErrorToast('login.error')
  }
  finally {
    isLoading.value = false
  }
}

async function onVerify() {
  const token = otp.value.join('')
  if (!sentTo.value || token.length !== OTP_LENGTH || isLoading.value)
    return

  isLoading.value = true
  const { error } = await verifyEmailOtp(sentTo.value, token)
  if (error) {
    logger.error('email otp verify error:', error)
    showErrorToast('login.email.invalidCode')
    otp.value = []
    isLoading.value = false
  }
  // On success the session watcher redirects.
}

function onChangeEmail() {
  sentTo.value = null
  otp.value = []
}

async function openDemo() {
  isDemo.value = 'true'
  await generateDemoData(locale.value)
  router.push(getSafeRedirectPath(route.query.redirect))
}

// Drop callback params so a reload does not repeat the toast.
function clearCallbackParams() {
  router.replace({ query: route.query.redirect ? { redirect: route.query.redirect } : {} })
}

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  // Supabase reports a failed redirect in the query (PKCE) or the hash (implicit).
  const hash = new URLSearchParams(window.location.hash.slice(1))
  const errorCode = params.get('error_code') ?? hash.get('error_code')
  const errorText = params.get('error_description') ?? hash.get('error_description') ?? params.get('error') ?? hash.get('error')
  const pending = sessionStorage.getItem(OAUTH_PENDING_KEY) === '1'
  const hasCode = params.has('code')
  sessionStorage.removeItem(OAUTH_PENDING_KEY)

  if (errorCode || errorText) {
    logger.error('auth redirect error:', errorCode, errorText)
    showErrorToast(errorCode === 'otp_expired' ? 'login.email.linkExpired' : 'login.error')
    clearCallbackParams()
    return
  }

  if (!pending && !hasCode)
    return

  isLoading.value = true
  // Resolves once detectSessionInUrl has exchanged ?code=, or skipped it because this
  // browser holds no PKCE verifier (magic link opened outside the browser that asked for it).
  const { error } = await useSupabase().auth.initialize()
  const { data } = await useSupabase().auth.getSession()
  if (data.session)
    return

  isLoading.value = false
  if (error)
    logger.error('auth callback error:', error)
  // pending without a code = the user backed out of Google: nothing to report.
  if (hasCode) {
    showErrorToast(pending ? 'login.error' : 'login.email.linkOtherBrowser')
    clearCallbackParams()
  }
})

// Fires for the Google/magic-link return, a verified code, and a sign-in in another tab.
watch(
  session,
  (next) => {
    if (next)
      router.replace(getSafeRedirectPath(route.query.redirect))
  },
  { immediate: true },
)
</script>

<template>
  <div
    class="mx-auto grid size-full h-dvh max-w-xl grid-rows-[auto_1fr_auto] px-2 py-3"
  >
    <div class="flex items-center justify-end">
      <div class="w-fit max-md:fixed max-md:top-5 max-md:right-5 max-md:z-30">
        <LayoutHeaderMenu />
      </div>
    </div>

    <div
      class="grid h-full overflow-hidden overflow-y-auto px-3 py-4"
    >
      <div class="flex flex-col items-center justify-center">
        <UiLogo size="lg" />
        <div class="pt-1 text-sm text-muted">
          {{ t("login.description") }}
        </div>

        <div class="grid w-80 max-w-full items-center gap-3 pt-22">
          <button
            class="shiny-pro"
            :disabled="isLoading"
            type="button"
            @click="onGoogle"
          >
            <span>
              <UIcon
                :name="isLoading ? 'i-lucide-loader-circle' : 'mdi:google'"
                class="size-5 shrink-0"
                :class="{ 'animate-spin': isLoading }"
              />
              {{ t("login.signInWithGoogle") }}
            </span>
          </button>

          <template v-if="isEmailSignIn">
            <USeparator
              :label="t('login.or')"
              :ui="{ label: 'text-muted' }"
              class="p-3"
            />

            <form
              v-if="!sentTo"
              class="grid gap-2"
              @submit.prevent="onSendEmail"
            >
              <UInput
                v-model="email"
                :disabled="isLoading"
                :placeholder="t('login.email.placeholder')"
                autocomplete="email"
                required
                size="xl"
                type="email"
              />
              <UButton
                :disabled="isLoading"
                :label="t('login.email.send')"
                block
                color="neutral"
                size="xl"
                type="submit"
                variant="subtle"
              />
            </form>

            <div
              v-else
              class="grid justify-items-center gap-3 text-center"
            >
              <div class="text-sm text-muted">
                {{ t('login.email.sent') }}
              </div>
              <UPinInput
                v-model="otp"
                :length="OTP_LENGTH"
                autofocus
                otp
                size="xl"
                type="number"
                @complete="onVerify"
              />
              <div class="flex gap-2">
                <UButton
                  :disabled="isLoading || resendIn > 0"
                  :label="resendIn > 0 ? t('login.email.resendIn', { s: resendIn }) : t('login.email.resend')"
                  color="neutral"
                  variant="ghost"
                  @click="onSendEmail"
                />
                <UButton
                  :disabled="isLoading"
                  :label="t('login.email.change')"
                  color="neutral"
                  variant="ghost"
                  @click="onChangeEmail"
                />
              </div>
            </div>
          </template>

          <USeparator
            :label="t('login.or')"
            :ui="{ label: 'text-muted' }"
            class="p-3"
          />

          <UiButtonAccent
            size="xl"
            type="button"
            variant="ghost"
            @click="openDemo"
          >
            {{ t("login.openDemo") }}
          </UiButtonAccent>
        </div>
      </div>
    </div>

    <div class="flex-co flex-center pl-2">
      <AppCopyright />
    </div>
  </div>
</template>

<style>
@property --sp-angle {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@property --sp-angle-offset {
  syntax: '<angle>';
  initial-value: 0deg;
  inherits: false;
}
@property --sp-percent {
  syntax: '<percentage>';
  initial-value: 5%;
  inherits: false;
}
@property --sp-shine {
  syntax: '<color>';
  initial-value: white;
  inherits: false;
}

.shiny-pro {
  --accent: var(--ui-primary, #146ef5);
  --bg: #0a0a0a;
  --animation: shiny-angle linear infinite;
  --duration: 9s;
  --shadow-size: 2px;
  --transition: 800ms cubic-bezier(0.25, 1, 0.5, 1);

  position: relative;
  isolation: isolate;
  overflow: hidden;
  width: 100%;
  cursor: pointer;
  padding: 1.05rem 2.5rem;
  outline-offset: 4px;
  border: 1px solid transparent;
  border-radius: 9999px;
  color: #fff;
  font-family: inherit;
  font-size: 1.0625rem;
  font-weight: 500;
  line-height: 1.2;
  background:
    linear-gradient(var(--bg), var(--bg)) padding-box,
    conic-gradient(
        from calc(var(--sp-angle) - var(--sp-angle-offset)),
        transparent,
        var(--accent) var(--sp-percent),
        var(--sp-shine) calc(var(--sp-percent) * 2),
        var(--accent) calc(var(--sp-percent) * 3),
        transparent calc(var(--sp-percent) * 4)
      )
      border-box;
  box-shadow: inset 0 0 0 1px #1a1818;
  transition: var(--transition);
  transition-property: --sp-angle-offset, --sp-percent, --sp-shine;
}

.shiny-pro span {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
}

.shiny-pro::before,
.shiny-pro::after {
  content: '';
  position: absolute;
  inset-block-start: 50%;
  inset-inline-start: 50%;
  z-index: -1;
  translate: -50% -50%;
  pointer-events: none;
}

.shiny-pro:active {
  translate: 0 1px;
}

/* dotted halo */
.shiny-pro::before {
  --size: calc(100% - var(--shadow-size) * 3);
  --position: 2px;
  --space: calc(var(--position) * 2);
  width: var(--size);
  height: var(--size);
  background: radial-gradient(circle at var(--position) var(--position), white calc(var(--position) / 4), transparent 0)
    padding-box;
  background-size: var(--space) var(--space);
  background-repeat: space;
  mask-image: conic-gradient(from calc(var(--sp-angle) + 45deg), black, transparent 10% 90%, black);
  border-radius: inherit;
  opacity: 0.4;
}

/* inner shimmer */
.shiny-pro::after {
  --animation: shiny-shimmer linear infinite;
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(-50deg, transparent, var(--accent), transparent);
  mask-image: radial-gradient(circle at bottom, transparent 40%, black);
  opacity: 0.6;
}

.shiny-pro,
.shiny-pro::before,
.shiny-pro::after {
  animation:
    var(--animation) var(--duration),
    var(--animation) calc(var(--duration) / 0.4) reverse paused;
  animation-composition: add;
}

.shiny-pro:is(:hover, :focus-visible) {
  --sp-percent: 20%;
  --sp-angle-offset: 95deg;
  --sp-shine: color-mix(in srgb, var(--accent) 55%, white);
}

.shiny-pro:is(:hover, :focus-visible)::before {
  --position: 0;
}

@keyframes shiny-angle {
  to {
    --sp-angle: 360deg;
  }
}
@keyframes shiny-shimmer {
  to {
    rotate: 360deg;
  }
}

@media (prefers-reduced-motion: reduce) {
  .shiny-pro,
  .shiny-pro::before,
  .shiny-pro::after {
    animation: none;
  }
}
</style>
