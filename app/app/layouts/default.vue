<script setup lang="ts">
import { useInitApp } from '~/components/app/useInitApp'
import { useCategoriesStore } from '~/components/categories/useCategoriesStore'
import { useMenuData } from '~/components/layout/useMenuData'
import { useSearch } from '~/components/search/useSearch'
import { useTrnsFormStore } from '~/components/trnForm/useTrnsFormStore'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const keepalive = ['Categories', 'CategoriesId', 'Wallets', 'WalletsId', 'Dashboard']

const { t } = useI18n()
const categoriesStore = useCategoriesStore()
const trnsFormStore = useTrnsFormStore()
const walletsStore = useWalletsStore()
const { isMenuOpen } = useMenuData()
const { isSearchOpen } = useSearch()
const { bootState, initApp, isHydrated, isOnboarded, isOnboardedHint } = useInitApp()
const { width } = useWindowSize()

const isShowSidebar = useCookie('finapp.isShowSidebar', { default: () => true })

// Only sync the hint once local data has hydrated - otherwise the empty stores during the
// load gap would wipe the hint exactly when it's needed.
watch([isOnboarded, isHydrated], () => {
  if (isHydrated.value)
    isOnboardedHint.value = isOnboarded.value
})

// Mount the trn form only after its first open so swiper stays out of the boot-critical
// chunks; an idle prefetch keeps that first open instant.
const hasTrnFormOpened = ref(false)
watch(() => trnsFormStore.ui.isShow, (show) => {
  if (show)
    hasTrnFormOpened.value = true
})

onMounted(() => {
  const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 2000))
  idle(() => {
    void (width.value < 767
      ? import('~/components/trnForm/Bottom.vue')
      : import('~/components/trnForm/Sidebar.vue'))
  })
})

const showShell = computed(() => bootState.value === 'ready')
const layoutClasses = computed(() => cn(
  'flex min-h-dvh flex-col transition-all duration-300 ease-in-out',
  showShell.value && (isShowSidebar.value ? 'md:pl-72' : 'md:pl-12'),
  isOnboarded.value && trnsFormStore.ui.isShow && 'md:pr-[360px]',
))

useAsyncData('app', initApp)

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
      : trnsFormStore.openFormForCreate()
  },
  'meta_k': () => {
    isSearchOpen.value = !isSearchOpen.value
  },
})
</script>

<template>
  <div
    :class="layoutClasses"
    style="margin-left: env(safe-area-inset-left)"
  >
    <div
      v-if="bootState === 'error'"
      class="flex-center h-dvh flex-col gap-6 px-4 text-center"
    >
      <UiLogo size="lg" />
      <p class="text-muted">
        {{ t('app.loadError') }}
      </p>
      <UButton
        size="xl"
        class="min-w-52 justify-center rounded-full px-8 py-3"
        @click="() => { initApp() }"
      >
        {{ t('app.retry') }}
      </UButton>
    </div>

    <template v-else>
      <template v-if="showShell">
        <LayoutSidebar
          :isShowSidebar
          @toggleSidebar="isShowSidebar = !isShowSidebar"
        />
      </template>

      <div :class="showShell ? 'flex min-h-dvh flex-col md:py-4 md:pr-4' : 'flex flex-1 items-center justify-center'">
        <div :class="showShell ? 'bg-default md:border-accented relative z-10 flex max-w-5xl flex-1 flex-col contain-paint md:rounded-md md:border lg:rounded-2xl' : 'w-full max-w-lg px-4'">
          <main
            id="pageScroll"
            :style="showShell ? 'padding-bottom: calc(64px + env(safe-area-inset-bottom))' : ''"
            class="@container/main flex-1 contain-paint md:!pb-0"
          >
            <slot :keepalive="{ include: keepalive }" />
          </main>
        </div>
      </div>

      <SearchModal v-if="showShell" />

      <template v-if="showShell">
        <TrnFormFloatOpener v-if="width >= 767" />

        <LayoutMenuBottom />
        <LayoutMenuBottomModal v-if="isMenuOpen" @close="isMenuOpen = false" />
      </template>
    </template>

    <Teleport
      v-if="hasTrnFormOpened && categoriesStore.hasItems && walletsStore.hasItems"
      to="body"
    >
      <LazyTrnFormBottom v-if="width < 767" />
      <LazyTrnFormSidebar v-if="width >= 767" />
    </Teleport>
  </div>
</template>
