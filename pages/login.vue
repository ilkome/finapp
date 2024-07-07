<script setup lang="ts">
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import type { ToastOptions } from 'vue3-toastify'
import UiToastContent from '~/components/ui/ToastContent.vue'
import { useUserStore } from '~/components/user/useUser'
import { auth } from '~/services/firebase/api'

definePageMeta({
  layout: 'center',
})

const { t } = useI18n()

useSeoMeta({
  title: t('title'),
})

const { $toast } = useNuxtApp()
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isLoading = ref(false)

if (route.query?.loading)
  isLoading.value = true

function signInWithGoogle() {
  router.push({ query: { loading: true } })
  isLoading.value = true

  const provider = new GoogleAuthProvider()
  signInWithPopup(auth, provider)
    .then((data) => { console.log('auth', data) })
    .catch((e) => {
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

watch(
  () => userStore.uid,
  (uid) => {
    uid && router.replace('/dashboard')
  },
  { immediate: true },
)
</script>

<template>
  <div
    class="mx-auto grid h-full w-full max-w-xl grid-rows-[auto,1fr,auto] p-2 py-4 md_p-6"
  >
    <div class="flex flex-wrap gap-2 justify-between items-start">
      <AppLocaleSwitcher />
      <AppThemeSwitcher class="justify-end" />
    </div>

    <div
      class="grid h-full items-center gap-8 overflow-hidden overflow-y-auto px-3 py-4"
    >
      <div class="flex flex-col items-center justify-center pb-10">
        <UiLogo class="pb-8" />

        <div class="flex min-w-[280px] flex-col items-center px-3 py-8">
          <UiButtonBlue :disabled="isLoading" @click="signInWithGoogle">
            {{ $t("loginWithGoogle") }}
            <Transition name="fadeIn">
              <div
                v-if="isLoading"
                class="flex-center absolute inset-0 h-full w-full bg-stone-800"
              >
                <UiSpinier />
              </div>
            </Transition>
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

ru:
  title: "Вход"
</i18n>
