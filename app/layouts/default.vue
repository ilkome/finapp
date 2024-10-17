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
import { useDemo } from '~/components/demo/useDemo'

const keepalive = ['Categories', 'Wallets', 'Dashboard']

const isDemo = useCookie('finapp.isDemo')
const trnFormStore = useTrnFormStore()
const { isModalOpen } = useAppNav()
const { loadDataFromCache, loadDataFromDB } = useInitApp()
const { loadDemoData } = useDemo()
const { pointerClasses } = usePointerClass()
const { t } = useI18n()
const { width } = useWindowSize()
const user = useCurrentUser()
const isShow = computed(() => trnFormStore.ui.isShow)

// useGuard()

const { error, status } = await useAsyncData(
  'app',
  async () => {
    if (isDemo.value) {
      await loadDemoData()
    }
    else if (user.value) {
      await loadDataFromCache()
      await loadDataFromDB()
    }
  },
  {
    lazy: true,
    server: false,
  },
)

useHead({
  bodyAttrs: {
    class: pointerClasses,
  },
  htmlAttrs: {
    lang: useI18n().locale.value,
  },
  titleTemplate: (chunk?: string) => (chunk ? `${chunk} - Finapp` : 'Finapp'),
})
</script>

<template>
  <NuxtPwaManifest />

  <div v-if="status === 'error'">
    <pre>{{ error }}</pre>
  </div>

  <div v-else-if="status === 'pending'">
    {{ t('base.loading') }}
  </div>

  <div v-else-if="status === 'success'" class="layoutBase">
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
