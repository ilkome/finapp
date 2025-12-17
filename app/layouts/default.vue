<script setup lang="ts">
import { useStorage, useWindowSize } from '@vueuse/core'

import { useAppNav } from '~/components/app/useAppNav'
import { useInitApp } from '~/components/app/useInitApp'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useDemo } from '~/components/demo/useDemo'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useTrnsStore } from '~/components/trns/useTrnsStore'
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
const { t } = useI18n()
const { width } = useWindowSize()

const isShowSidebar = useStorage('isShowSidebar', true)

const { error, status } = useAsyncData(
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

defineShortcuts({
  'escape': () => {
    if (trnsFormStore.ui.isShow)
      trnsFormStore.ui.isShow = false
  },
  'meta_\\': () => {
    isShowSidebar.value = !isShowSidebar.value
  },
  'meta_g': () => {
    trnsFormStore.ui.isShow
      ? trnsFormStore.ui.isShow = false
      : trnsFormStore.trnFormCreate()
  },
})

usePageScroll()
</script>

<template>
  <div
    :class="{ 'md:pr-[360px]': trnsFormStore.ui.isShow && width >= 767 }"
    class="h-dvh bg-[var(--item-1)] transition-all duration-300 ease-in-out"
    style="margin-left: env(safe-area-inset-left)"
  >
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

      <div
        class="grid h-full overflow-hidden sm:pl-12 md:p-4 md:pl-12"
        :class="{
          'sm:pl-74 md:pl-74': isShowSidebar && width >= 767,
        }"
      >
        <div class="bg-default sm:border-item-4 relative z-10 h-full max-w-5xl overflow-hidden sm:rounded-md sm:border lg:rounded-2xl">
          <main
            id="pageScroll"
            style="padding-bottom: calc(50px + env(safe-area-inset-bottom))"
            class="@container/main grid h-full overflow-hidden overflow-y-auto"
          >
            <slot :keepalive="{ include: keepalive }" />
          </main>
        </div>
      </div>

      <TrnFormFloatOpener />

      <!-- Menu -->
      <LayoutMenuBottom />
      <LayoutMenuBottomModal v-if="isModalOpen('menu')" />
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
