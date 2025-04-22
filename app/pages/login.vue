<script setup lang="ts">
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

import { useDemo } from '~/components/demo/useDemo'
import UiToastContent from '~/components/ui/ToastContent.vue'

const auth = useFirebaseAuth()!

definePageMeta({
  layout: 'empty',
})

const { locale, t } = useI18n()

useSeoMeta({
  ogTitle: t('title'),
  title: t('title'),
})

const { $toast } = useNuxtApp()
const { generateDemoData } = useDemo()
const route = useRoute()
const router = useRouter()
const { isDemo } = useDemo()
const isLoading = ref(false)

if (route.query?.loading)
  isLoading.value = true

function signInWithGoogle() {
  isDemo.value = 'false'
  router.push({ query: { loading: 'true' } })
  isLoading.value = true

  signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => {
    $toast(UiToastContent, {
      autoClose: 6000,
      data: {
        description: e.message,
        title: 'Error',
      },
      type: 'error',
    })

    isLoading.value = false
  })
}

onMounted(() => {
  if (route.query?.loading) {
    isLoading.value = true
    const newRoute = { ...route }
    delete newRoute.query?.loading
    router.replace(newRoute)
    setTimeout(() => (isLoading.value = false), 10000)
  }
})

async function openDemo() {
  isDemo.value = 'true'
  await generateDemoData(locale.value)
  router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard')
}
</script>

<template>
  <div class="h-dvh mx-auto grid size-full max-w-xl grid-rows-[auto_1fr_auto] px-2 py-3">
    <div class="flex items-center justify-end gap-3">
      <LocaleSwitcher />
      <ThemeSwitcher />
      <ThemePicker />
      <UButton
        icon="mdi:github"
        color="neutral"
        variant="ghost"
        square
        aria-label="GitHub"
        to="https://github.com/ilkome/finapp"
        target="_blank"
        size="lg"
      />
    </div>

    <div
      class="grid h-full items-center gap-8 overflow-hidden overflow-y-auto px-3 py-4"
    >
      <div class="flex flex-col items-center justify-center pb-10">
        <UiLogo class="pb-0 !text-6xl !font-extrabold" />
        <div class="pt-1 text-sm text-(--ui-text-muted)">
          {{ t('description') }}
        </div>

        <div class="grid min-w-[320px] items-center gap-2 py-14">
          <UiButtonAccent
            :loading="isLoading"
            rounded
            size="xl"
            @click="signInWithGoogle"
          >
            {{ t("loginWithGoogle") }}
          </UiButtonAccent>

          <USeparator
            label="or"
            class="pt-3 px-3"
          />

          <UiButtonAccent
            rounded
            size="xl"
            variant="ghost"
            @click="openDemo"
          >
            {{ t("openDemo") }}
          </UiButtonAccent>
        </div>
      </div>
    </div>

    <div class="flex-center">
      <AppCopyright />
    </div>
  </div>
</template>

<i18n lang="yaml">
en:
  title: "Login"
  openDemo: "Open Demo"
  description: Powerful open-source finance application

ru:
  title: "Вход"
  openDemo: "Открыть демо"
  description: Персональный финансовый ассистент
</i18n>
