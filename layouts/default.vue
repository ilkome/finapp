<script setup lang="ts">
import debounce from '~/utils/debounce'
import detectTouch from '~/assets/js/isTouchDevice'
import useUIView from '~/components/layout/useUIView'

const { $store } = useNuxtApp()

useLazyAsyncData('', async() => {
  const { initUI } = useUIView()
  await initUI()
})

const keepAliveInclude = ['index', 'PagesIndex', 'PagesWalletsIndex', 'PagesCategoriesIndex', 'PagesHistory']

/**
 * Update modal
 */
const isShowUpdateApp = ref(false)
onMounted(async() => {
  const workbox = await window.$workbox
  if (workbox) {
    workbox.addEventListener('installed', (event) => {
      isShowUpdateApp.value = event.isUpdate
    })
  }
})

/**
 * Detect touch device
 */
const isTouchDevice = ref(false)

/**
 * Page dimensions
 */
function getPageDimensions() {
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight
  document.documentElement.style.setProperty('--height', `${height}px`)
  $store.dispatch('ui/setAppDimensions', { width, height })
}

const touchClassNames = computed(() => ({
  isNotTouchDevice: !isTouchDevice.value,
  isTouchDevice: isTouchDevice.value,
}))

onMounted(() => {
  isTouchDevice.value = detectTouch()
  getPageDimensions()
  window.addEventListener('resize', debounce(getPageDimensions, 300))
})
</script>

<template lang="pug">
.overflow-hidden.relative.h-full.min-w-base.font-roboto.text-slate-500.dark_text-gray-400.leading-none.antialiased.bg-white.dark_bg-dark3.max-w-7xl(
  :class="touchClassNames"
)
  LayoutModals

  PortalTarget(
    multiple
    name="modal"
  )

  LazyAppUpdateAppModal(
    v-if="isShowUpdateApp"
    @onClose="isShowUpdateApp = false"
  )

  .h-full.grid(
    class="grid-rows-[1fr_auto] xl_grid-cols-[auto_1fr]"
  )
    .hidden.xl_block
      LayoutSidebar

    .overflow-hidden.h-full.xl_px-8.grid
      Nuxt(keep-alive :keep-alive-props="{ include: keepAliveInclude }")

    .xl_hidden
      LayoutBottomMenu
</template>

<style lang="stylus">
@import '~assets/stylus/index'
@import '~assets/stylus/colors-dark'
@import '~assets/stylus/colors-light'
</style>
