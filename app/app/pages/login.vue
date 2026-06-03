<script setup lang="ts">
import pkg from '~~/package.json'

import { useDemo } from '~/components/demo/useDemo'
import { showErrorToast } from '~/composables/useStoreSync'
import { useSupabaseAuth } from '~/composables/useSupabase'

const { signInWithPassword, signUp } = useSupabaseAuth()
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

        <form class="grid min-w-[320px] items-center gap-3 py-14" @submit.prevent="submit">
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
