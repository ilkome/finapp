<script setup lang="ts">
import pkg from '~~/package.json'

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

const { generateDemoData, isDemo } = useDemo()
const route = useRoute()
const router = useRouter()

const isLoading = ref(false)

async function signInWithGoogle() {
  isDemo.value = null
  isLoading.value = true

  const redirectTo = getSafeRedirectPath(route.query.redirect)
  localStorage.setItem('finapp.authRedirect', redirectTo)

  localStorage.removeItem('better-auth_cookie')
  localStorage.removeItem('better-auth_session_data')

  try {
    const result = await signIn.social({ callbackURL: `${window.location.origin}/auth/callback`, provider: 'google' })

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
        <UiLogo size="lg" />
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

    <div class="flex-center flex-col">
      <AppCopyright />
      <div class="text-muted pt-4 text-xs">
        {{ t('app.version') }} {{ pkg.version }}
      </div>
    </div>
  </div>
</template>
