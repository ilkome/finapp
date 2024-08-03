<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { useAppNav } from '~/components/app/useAppNav'
import { usePointerClass } from '~/components/layout/usePointerClass'
import { useUserStore } from '~/components/user/useUser'

import '~/assets/css/fullpage.css'
import '~/assets/css/reset.css'
import '~/assets/stylus/index.styl'

const { width } = useWindowSize()
const { pointerClasses } = usePointerClass()
const { isModalOpen } = useAppNav()

useHead({
  bodyAttrs: {
    class: pointerClasses,
  },
  htmlAttrs: {
    lang: useI18n().locale.value,
  },
})

useHead({
  titleTemplate: chunk => (chunk ? `${chunk} - Finapp` : 'Finapp'),
})

watch(
  () => useUserStore().uid,
  (value) => {
    if (value && useRoute().name === 'login') {
      useRouter().replace('/dashboard')
    }
    else {
      useRouter().replace('/login')
    }
  },
)

const keepalive = ['Categories', 'Wallets', 'Dashboard']
</script>

<template>
  <div v-if="!useUserStore()?.uid">
    Loading...
  </div>

  <div v-if="useUserStore()?.uid" class="layoutBase">
    <div class="grid h-full sm:grid-cols-[auto_1fr_auto]">
      <LayoutSidebar />

      <LayoutMenuSidebar
        :isShowTitle="false"
        class="hidden lg:hidden sm:flex sm:flex-col gap-1 justify-center sm:align-center bg-item-4"
      />

      <div class="@container/main grid h-full pb-12 sm:pb-0 overflow-hidden">
        <NuxtPage :keepalive="{ include: keepalive }" />
      </div>
    </div>

    <LayoutMenuBottom class="absolute bottom-0 sm:bottom-inherit sm:hidden left-0 z-20 w-full bg-item-4 backdrop-blur lg:hidden" />
    <LayoutMenuBottomModal v-if="isModalOpen('menu')" />
    <TrnFormFloatOpener />
  </div>

  <Teleport to="body">
    <DevModalOpener />
    <TrnFormBottom v-if="width < 767" />
  </Teleport>

  <TrnFormSidebar v-if="width >= 767" />
</template>
