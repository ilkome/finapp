<script setup lang="ts">
import { useAppNav } from '~/components/app/useAppNav'
import { usePointerClass } from '~/components/layout/usePointerClass'
import { useUserStore } from '~/components/user/useUser'

import '~/assets/css/fullpage.css'
import '~/assets/css/index.css'
import '~/assets/css/reset.css'
import '~/assets/css/themes.css'
import '~/assets/stylus/index.styl'

const { pointerClasses } = usePointerClass()
const { isModalOpen } = useAppNav()

useHead({
  bodyAttrs: {
    class: pointerClasses,
  },
})

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
  <div v-if="!useUserStore()?.uid">
    Loading...
  </div>

  <div v-if="useUserStore()?.uid" class="layoutBase">
    <div class="grid h-full sm_grid-cols-[auto_1fr_auto]">
      <LayoutSidebar />

      <LayoutMenuSidebar
        :isShowTitle="false"
        class="hidden lg_hidden sm_flex sm_flex-col gap-1 justify-center sm_align-center bg-item-4"
      />

      <div class="@container/main grid h-full overflow-hidden sm_pl-2 lg_pl-0">
        <NuxtPage />
      </div>
    </div>

    <LayoutMenuBottom class="absolute bottom-0 sm_bottom-inherit sm_hidden left-0 z-20 w-full bg-item-4 backdrop-blur lg_hidden" />
    <LayoutMenuBottomModal v-if="isModalOpen('menu')" />
    <TrnFormFloatOpener />
  </div>

  <CurrenciesModal />
  <DevModalOpener />
  <TrnForm />
</template>
