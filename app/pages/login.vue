<script setup lang="ts">
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import type { ToastOptions } from 'vue3-toastify'
import UiToastContent from '~/components/ui/ToastContent.vue'

const auth = useFirebaseAuth()!

definePageMeta({
  layout: 'center',
})

const { t } = useI18n()

useSeoMeta({
  title: t('title'),
})

const { $toast } = useNuxtApp() as unknown as { $toast: (c: any, o: any) => void }
const route = useRoute()
const router = useRouter()
const isDemo = useCookie('finapp.isDemo')
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
    } as ToastOptions)

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

function openDemo() {
  isDemo.value = 'true'
  router.push(typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard')
}
</script>

<template>
  <div class="md_p-6 mx-auto grid h-full w-full max-w-xl grid-rows-[auto,1fr,auto] p-2 py-4">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <AppLocaleSwitcher />
      <AppThemeSwitcher class="justify-end" />
    </div>

    <div
      class="grid h-full items-center gap-8 overflow-hidden overflow-y-auto px-3 py-4"
    >
      <div class="flex flex-col items-center justify-center pb-10">
        <UiLogo class="!text-5xl !font-extrabold pb-6" />

        <div class="grid min-w-[280px] gap-5 items-center px-3 py-8">
          <UiButtonBlue :disabled="isLoading" @click="signInWithGoogle">
            {{ t("loginWithGoogle") }}
            <Transition name="fadeIn">
              <div
                v-if="isLoading"
                class="flex-center absolute inset-0 h-full w-full bg-stone-800"
              >
                <UiSpinier />
              </div>
            </Transition>
          </UiButtonBlue>

          <UiButtonBlue :disabled="isLoading" @click="openDemo">
            {{ t("openDemo") }}
          </UiButtonBlue>
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
