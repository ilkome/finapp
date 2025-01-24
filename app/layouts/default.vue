<script setup lang="ts">
import '~/assets/css/theme.css'
import '~/assets/css/tailwind.css'

import { Analytics } from '@vercel/analytics/nuxt'
import { SpeedInsights } from '@vercel/speed-insights/nuxt'
import { useMagicKeys, useStorage, useWindowSize } from '@vueuse/core'

import { useAppNav } from '~/components/app/useAppNav'
import { useInitApp } from '~/components/app/useInitApp'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useDemo } from '~/components/demo/useDemo'
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

const isShowSidebar = useStorage('isShowSidebar', true)

useGuard()

const { error, status } = await useAsyncData(
  'app',
  async () => {
    const localAuthUid = await useCookie('finapp.localAuthUid')

    if (isDemo.value) {
      await loadDataFromCache()
    }
    else if (userStore.currentUser || localAuthUid.value) {
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

const { escape, shift_d, shift_s } = useMagicKeys()

watch(shift_s!, (v) => {
  if (v) {
    if (trnsFormStore.ui.isShow)
      trnsFormStore.ui.isShow = false
    else
      trnsFormStore.trnFormCreate()
  }
})

watch(escape!, (v) => {
  if (trnsFormStore.ui.isShow && v)
    trnsFormStore.ui.isShow = false
})

watch(shift_d!, (v) => {
  if (v)
    isShowSidebar.value = !isShowSidebar.value
})
</script>

<template>
  <div
    :class="{ 'md:translate-x-20': trnsFormStore.ui.isShow && isShowSidebar && width >= 767 }"
    class="layoutBase @container/main overflow-hidden transition-all duration-300 ease-in-out"
    style="margin-left: env(safe-area-inset-left)"
  >
    <NuxtPwaManifest />
    <SpeedInsights />
    <Analytics />

    <div v-if="status === 'error'">
      <pre>{{ error }}</pre>
    </div>

    <div v-else-if="status === 'pending' || trnsStore.items === false || walletsStore.items === false">
      {{ t('base.loading') }}
    </div>

    <template v-else-if="status === 'success'">
      <LayoutSidebar
        :isShowTrnForm="trnsFormStore.ui.isShow"
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
      <TrnFormSidebar v-if="width >= 767" />
    </Teleport>
  </div>
</template>
