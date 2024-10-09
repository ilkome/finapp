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
      <LayoutSidebar :isShow />

      <LayoutMenuSidebar
        :isShowTitle="false"
        class="sm:align-center hidden justify-center gap-1 bg-item-4 sm:flex sm:flex-col lg:hidden"
      />

      <div class="@container/main grid h-full overflow-hidden pb-12 sm:pb-0">
        <NuxtPage :keepalive="{ include: keepalive }" />
      </div>
    </div>

    <LayoutMenuBottom />
    <LayoutMenuBottomModal v-if="isModalOpen('menu')" />
    <TrnFormFloatOpener />
  </div>

  <Teleport to="body">
    <DevModalOpener />
    <TrnFormBottom v-if="width < 767" />
  </Teleport>

  <TrnFormSidebar v-if="width >= 767" />
</template>
