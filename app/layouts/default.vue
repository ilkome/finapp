<script setup lang="ts">
import '~/assets/css/theme.css'
import '~/assets/css/tailwind.css'

import { useStorage, useWindowSize } from '@vueuse/core'

import { useAppNav } from '~/components/app/useAppNav'
import { useInitApp } from '~/components/app/useInitApp'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useDemo } from '~/components/demo/useDemo'
import { usePointerClass } from '~/components/layout/usePointerClass'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
import { useGuard } from '~/components/user/useGuard'
import { useUserStore } from '~/components/user/useUserStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const keepalive = ['Categories', 'CategoriesId', 'Wallets', 'WalletsId', 'Dashboard']

const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()
const userStore = useUserStore()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()
const { isDemo } = useDemo()
const { isModalOpen } = useAppNav()
const { loadDataFromCache, loadDataFromDB } = useInitApp()
const { locale, t } = useI18n()
const { pointerClasses } = usePointerClass()
const { width } = useWindowSize()

const isShowTrnForm = computed(() => trnsFormStore.ui.isShow)
const isShowSidebar = useStorage('isShowSidebar', true)

useGuard()

const { error, status } = await useAsyncData(
  'app',
  async () => {
    const localAuthUid = await useCookie('finapp.localAuthUid')

    if (isDemo.value) {
      await loadDataFromCache()
    }
    else if (userStore.user || localAuthUid.value) {
      await loadDataFromCache()
      loadDataFromDB()
    }
  },
  {
    lazy: false,
    server: false,
  },
)

useHead({
  bodyAttrs: {
    class: pointerClasses,
  },
  htmlAttrs: {
    lang: locale.value,
  },
})

useSeoMeta({
  description: t('app.desc'),
  ogDescription: t('app.desc'),
  ogTitle: (chunk?: string) => chunk ? `${chunk} - ${t('appName')}` : t('appName'),
  titleTemplate: (chunk?: string) => chunk ? `${chunk} - ${t('appName')}` : t('appName'),
})

usePageScroll()
</script>

<template>
  <div
    :class="{ 'md:translate-x-20': isShowTrnForm && isShowSidebar && width >= 767 }"
    class="layoutBase @container/main overflow-hidden transition-all duration-300 ease-in-out"
  >
    <NuxtPwaManifest />

    <div v-if="status === 'error'">
      <pre>{{ error }}</pre>
    </div>

    <div v-else-if="status === 'pending' || trnsStore.items === false || walletsStore.items === false">
      {{ t('base.loading') }}
    </div>

    <template v-else-if="status === 'success'">
      <LayoutSidebar
        :isShowTrnForm
        :isShowSidebar
        @toggleSidebar="isShowSidebar = !isShowSidebar"
      />

      <main
        id="pageScroll"
        :class="{
          'sm:pl-72': isShowSidebar && width >= 767,
        }"
        class="grid h-full overflow-hidden overflow-y-auto sm:p-2 sm:pl-12"
      >
        <NuxtPage :keepalive="{ include: keepalive }" />
      </main>

      <!-- Menu -->
      <LayoutMenuBottom />
      <LayoutMenuBottomModal v-if="isModalOpen('menu')" />
      <TrnFormFloatOpener />
    </template>

    <Teleport
      v-if="categoriesStore.hasItems && walletsStore.hasItems"
      to="body"
    >
      <TrnFormBottom v-if="width < 767" />
      <TrnFormSidebar v-if="width > 767" />
    </Teleport>
  </div>
</template>
