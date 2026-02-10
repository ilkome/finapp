<script setup lang="ts">
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

import { useDemo } from '~/components/demo/useDemo'

const auth = useFirebaseAuth()!
const toast = useToast()

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

if (route.query?.loading)
  isLoading.value = true

function signInWithGoogle() {
  isDemo.value = 'false'
  router.push({ query: { loading: 'true' } })
  isLoading.value = true

  signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => {
    toast.add({
      color: 'error',
      description: e.message,
      title: 'Error',
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
