<script setup lang="ts">
import '~/assets/stylus/index.styl'

import { useWindowSize } from '@vueuse/core'

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
// const user = useCurrentUser()
const walletsStore = useWalletsStore()
const trnsStore = useTrnsStore()
const { isDemo } = useDemo()
const { isModalOpen } = useAppNav()
const { loadDataFromCache, loadDataFromDB } = useInitApp()
const { locale, t } = useI18n()
const { pointerClasses } = usePointerClass()
const { width } = useWindowSize()

const isShow = computed(() => trnsFormStore.ui.isShow)

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
</script>

<template>
  <div>
    <NuxtPwaManifest />

    <div v-if="status === 'error'">
      <pre>{{ error }}</pre>
    </div>

    <div v-else-if="status === 'pending' || trnsStore.items === false || walletsStore.items === false">
      {{ t('base.loading') }}
    </div>

    <div v-else-if="status === 'success'" class="layoutBase">
      <div class="grid h-full sm:grid-cols-[auto_1fr_auto]">
        <LayoutSidebar :isShow />

        <LayoutMenuSidebar
          :isShowTitle="false"
          class="sm:align-center bg-item-4 hidden justify-center gap-1 sm:flex sm:flex-col md:hidden"
        />

        <div
          :class="{ 'md:translate-x-20': isShow }"
          class="@container/main grid h-full overflow-hidden pb-12 transition-all duration-300 ease-in-out sm:pb-0 md:pb-0"
        >
          <NuxtPage :keepalive="{ include: keepalive }" />
        </div>
      </div>

      <LayoutMenuBottom />
      <LayoutMenuBottomModal v-if="isModalOpen('menu')" />
      <TrnFormFloatOpener />
    </div>

    <Teleport
      v-if="categoriesStore.hasItems && walletsStore.hasItems"
      to="body"
    >
      <TrnFormBottom v-if="width < 767" />
      <TrnFormSidebar v-if="width >= 767" />
    </Teleport>
  </div>
</template>
