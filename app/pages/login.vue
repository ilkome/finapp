<script setup lang="ts">
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

import { useDemo } from '~/components/demo/useDemo'
import UiToastContent from '~/components/ui/ToastContent.vue'

const auth = useFirebaseAuth()!

definePageMeta({
  layout: 'center',
})

const { locale, t } = useI18n()

useSeoMeta({
  description: t('app.desc'),
  ogDescription: t('app.desc'),
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
  <div class="mx-auto grid size-full max-w-xl grid-rows-[auto,1fr,auto] px-2 py-3 md:p-6">
    <div class="flex items-center justify-between gap-2">
      <AppLocaleSwitcher />
      <AppThemeSwitcher />
    </div>

    <div
      class="grid h-full items-center gap-8 overflow-hidden overflow-y-auto px-3 py-4"
    >
      <div class="flex flex-col items-center justify-center pb-10">
        <UiLogo class="pb-0 !text-5xl !font-extrabold" />

        <div class="grid min-w-[280px] items-center gap-5 px-3 py-8">
          <UiButtonAccent
            :loading="isLoading"
            size="xl"
            rounded
            @click="signInWithGoogle"
          >
            {{ t("loginWithGoogle") }}
          </UiButtonAccent>

          <UiButtonAccent
            size="xl"
            variant="outline"
            rounded
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

ru:
  title: "Вход"
  openDemo: "Открыть демо"
</i18n>
