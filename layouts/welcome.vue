<script setup lang="ts">
import debounce from '~/utils/debounce'
import detectTouch from '~/assets/js/isTouchDevice'
import useUIView from '~/components/layout/useUIView'

const { $store } = useNuxtApp()

useLazyAsyncData('posts', async() => {
  const { initUI } = useUIView()
  await initUI()
})

const keepAliveInclude = ['PagesIndex, PagesWallets', 'PagesCategories', 'PagesHistory']

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
.font-roboto.text-gray-500.leading-none.antialiased.overflow-hidden.relative.h-full.min-w-base.flex(
  :class="[touchClassNames, 'dark_text-gray-400']"
)
  LayoutModals

  PortalTarget(
    multiple
    name="modal"
  )

  //- LazyAppUpdateAppModal(
  //-   v-if="isShowUpdateApp"
  //-   @onClose="isShowUpdateApp = false"
  //- )

  .layout__wrap.overflow-hidden.flex-grow.h-full.flex
    transition(name="fadeIn" appear)
      Nuxt(keep-alive :keep-alive-props="{ include: keepAliveInclude }")
</template>

<style lang="stylus">
@import '~assets/stylus/base/animations'
@import '~assets/stylus/index'
@import '~assets/stylus/colors-dark'
@import '~assets/stylus/colors-light'
</style>

<style lang="stylus" scoped>
.layout
  &__wrap
    grid-template-columns 1fr
    grid-template-rows 1fr minmax(auto, auto)

    +media(1200px)
      grid-template-rows 1fr auto
      grid-template-columns minmax(auto, auto) 1fr

  &__sidebar
    display none

    +media(1200px)
      display block

  &__content
    overflow hidden
    overflowScrollY()
    display grid
    height 100%
    max-width 1100px
    padding 0
    background var(--c-bg-3)
    +media(800px)
      padding 0 32px
    +media(1000px)
      padding 0 64px

  &__menu
    background var(--c-bg-3)

    +media(1200px)
      display none
</style>
