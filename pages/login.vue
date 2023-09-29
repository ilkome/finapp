<script setup lang="ts">
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '~/services/firebase/api'

const { $notify } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const isLoading = ref(false)

if (route.query?.loading)
  isLoading.value = true

function signInWithGoogle() {
  router.push({ query: { loading: true } })
  isLoading.value = true

  const provider = new GoogleAuthProvider()
  signInWithPopup(auth, provider)
    .catch((e) => {
      $notify({
        duration: 6000,
        text: e.message,
        title: 'Error',
        type: 'error',
      })
      isLoading.value = false
    })
}

onMounted(() => {
  if (route.query?.loader) {
    isLoading.value = true
    const newRoute = { ...route }
    delete newRoute.query?.loader
    router.replace(newRoute)
  }

  setTimeout(() => isLoading.value = false, 10000)
})
</script>

<script lang="ts">
export default defineComponent({
  layout: 'login',

  fetch({ store, redirect }) {
    if (store.state.user?.user)
      redirect('/')
  },
})
</script>

<template lang="pug">
.grid.h-full.text-center(class="grid-rows-[auto,1fr,auto]")
  .max-w-xl.mx-auto.py-4.p-2.w-full.md_p-6
    .flex.justify-between
      LocaleSwitcher
      ThemeSwitcher

  .h-full.grid.items-center.gap-8.py-4.px-3.h-full.overflow-hidden.overflow-y-auto
    .flex.flex-col.items-center.justify-center.pb-10
      UiLogo

      .px-3.py-8.flex.flex-col.items-center(
        class="min-w-[280px]"
      )
        UiButtonBlue(
          :disabled="isLoading"
          @click="signInWithGoogle"
        )
          | {{ $t('loginWithGoogle') }}
          transition(name="fadeIn")
            .absolute.inset-0.w-full.h-full.flex-center.bg-accent-2(v-if="isLoading")
              UiSpinier

  .p-4.md_p-6
    CommonCopyright
</template>
