<script setup lang="ts">
import { usePointerClass } from '~/components/layout/usePointerClass'
import { useTrnForm } from '~/components/trnForm/useTrnForm'
import { useUserStore } from '~/components/user/useUser'

import '~/assets/css/fullpage.css'
import '~/assets/css/index.css'
import '~/assets/css/reset.css'
import '~/assets/css/themes.css'
import '~/assets/stylus/index.styl'

const { trnFormCreate } = useTrnForm()
const { pointerClasses } = usePointerClass()

useHead({
  bodyAttrs: {
    class: pointerClasses,
  },
})

// definePageMeta({
//   middleware: 'auth',
// })

// const keepAliveInclude = [
//   'pages/categories/index.vue',
//   'pages/dashboard.vue',
//   'pages/wallets/index.vue',
// ]

useHead({
  titleTemplate: chunk => (chunk ? `${chunk} - Finapp` : 'Finapp'),
})

watch(
  () => useUserStore().uid,
  (value) => {
    value
      ? useRoute().name === 'login' && useRouter().replace('/dashboard')
      : useRouter().replace('/login')
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="useUserStore()?.uid" class="layoutBase">
    <div class="grid h-full lg_grid-cols-[auto_1fr]">
      <div class="hidden h-full w-72 overflow-hidden lg_block">
        <LayoutSidebar />
      </div>

      <div class="grid h-full overflow-hidden">
        <NuxtPage />
      </div>

      <div
        class="flex-end group absolute bottom-6 right-6 z-10 hidden cursor-pointer justify-center lg_flex"
        @click="() => trnFormCreate()"
      >
        <div
          class="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--c-blue-1)] text-3xl text-[var(--c-font-1)] transition group-hover_scale-125"
        >
          <i class="mdi mdi-plus" />
        </div>
      </div>

      <AppMenuBottom />
    </div>

    <TrnFormWrap />
    <TrnsItemModal />
    <CurrenciesModal />
  </div>
</template>
