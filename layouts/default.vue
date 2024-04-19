<script setup lang="ts">
import { useAppNav } from '~/components/app/useAppNav'
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
  <div v-if="useUserStore()?.uid" class="layoutBase">
    <div class="grid h-full sm_grid-cols-[auto_1fr_auto]">
      <LayoutSidebar
        class="hidden h-full w-64 overflow-hidden border-r border-item-5 lg_block h-full overflow-y-auto bg-item-4"
      />

      <LayoutMenuSidebar
        :isShowTitle="false"
        class="hidden lg_hidden sm_flex sm_flex-col justify-center bg-item-4"
      />

      <div class="grid h-full overflow-hidden sm_pl-2 lg_pl-0">
        <NuxtPage />
      </div>
    </div>

    <LayoutMenuBottom class="absolute bottom-0 sm_bottom-inherit sm_hidden left-0 z-20 w-full bg-item-4 backdrop-blur lg_hidden" />
    <LayoutMenuBottomModal v-if="isModalOpen('menu')" />

    <div
      class="flex-end group absolute bottom-6 right-6 z-10 hidden justify-center lg_flex"
      @click="() => trnFormCreate()"
    >
      <div
        class="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--c-blue-1)] text-3xl text-[var(--c-font-1)] transition group-hover_scale-125"
      >
        <i class="mdi mdi-plus" />
      </div>
    </div>
  </div>

  <CurrenciesModal />
</template>
