<script setup lang="ts">
import '~/assets/css/fullpage.css'
import '~/assets/css/reset.css'
import '~/assets/stylus/index.styl'
import { useWindowSize } from '@vueuse/core'
import { useAppNav } from '~/components/app/useAppNav'
import { useInitApp } from '~/components/app/useInitApp'
import { usePointerClass } from '~/components/layout/usePointerClass'
import { useTrnFormStore } from '~/components/trnForm/useTrnForm'
import { useGuard } from '~/components/user/useGuard'

const trnFormStore = useTrnFormStore()
const user = useCurrentUser()
const { isModalOpen } = useAppNav()
const { loadAppFromCache, loadAppFromDB } = useInitApp()
const { pointerClasses } = usePointerClass()
const { t } = useI18n()
const { width } = useWindowSize()

const isShow = computed(() => trnFormStore.ui.isShow)

useHead({
  bodyAttrs: {
    class: pointerClasses,
  },
  htmlAttrs: {
    lang: useI18n().locale.value,
  },
  titleTemplate: (chunk?: string) => (chunk ? `${chunk} - Finapp` : 'Finapp'),
})

const keepalive = ['Categories', 'Wallets', 'Dashboard']

await useGuard()
await loadAppFromCache()
await loadAppFromDB()
</script>

<template>
  <NuxtPwaManifest />

  <div v-if="!user?.uid">
    {{ t('base.loading') }}
  </div>

  <div v-if="user?.uid" class="layoutBase">
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
