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
  titleTemplate: chunk => chunk ? `${chunk} - Finapp` : 'Finapp',
})

watch(() => useUserStore().uid, (value) => {
  value
    ? useRoute().name === 'login' && useRouter().replace('/dashboard')
    : useRouter().replace('/login')
}, { immediate: true })
</script>

<template>
  <div v-if="useUserStore()?.uid" class="layoutBase">
    <div class="h-full grid lg_grid-cols-[auto_1fr]">
      <div class="hidden overflow-hidden h-full w-72 lg_block">
        <LayoutSidebar />
      </div>

      <div class="overflow-hidden h-full grid">
        <!-- <slot /> -->
        <NuxtPage />
      </div>

      <div class="cursor-pointer flex-end justify-center group hidden z-10 absolute right-6 bottom-6 lg_flex" @click="trnFormCreate">
        <div class="flex items-center justify-center w-12 h-12 text-[var(--c-font-1)] text-3xl bg-[var(--c-blue-1)] rounded-full transition group-hover_scale-125">
          <i class="mdi mdi-plus" />
        </div>
      </div>

      <div class="z-10 absolute bottom-0 left-0 w-full backdrop-blur lg_hidden bg-white/70 dark_bg-dark3/70">
        <LayoutMenuBottom />
      </div>
    </div>

    <TrnFormWrap />
    <TrnsItemModal />
    <CurrenciesModal />
    <AppNotifications />
  </div>
</template>
