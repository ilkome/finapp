<script setup lang="ts">
import { usePointer } from '@vueuse/core'
import debounce from '~/utils/debounce'
import useUIView from '~/components/layout/useUIView'

const { $store } = useNuxtApp()

useLazyAsyncData('posts', async () => {
  const { initUI } = useUIView()
  await initUI()
})

const keepAliveInclude = ['PagesIndex, PagesWallets', 'PagesCategories', 'PagesHistory']

/**
 * Update modal
 */
const isShowUpdateApp = ref(false)
onMounted(async () => {
  const workbox = await window.$workbox
  if (workbox) {
    workbox.addEventListener('installed', (event) => {
      isShowUpdateApp.value = event.isUpdate
    })
  }
})

const { pointerType } = usePointer()
const classes = computed(() => [
  {
    mouse: pointerType.value === 'mouse' || !pointerType.value,
    touch: pointerType.value === 'touch',
  },
  `
    overflow-hidden relative
    flex
    h-full min-w-base
    font-roboto text-gray-500 dark_text-gray-400 leading-none antialiased
    bg-skin-layout-main
  `,
])

/**
 * Page dimensions
 */
function getPageDimensions() {
  const width = document.documentElement.clientWidth
  const height = document.documentElement.clientHeight
  document.documentElement.style.setProperty('--height', `${height}px`)
  $store.dispatch('ui/setAppDimensions', { width, height })
}

onMounted(() => {
  getPageDimensions()
  window.addEventListener('resize', debounce(getPageDimensions, 300))
})
</script>

<template lang="pug">
div(:class="classes")
  LayoutModals

  PortalTarget(
    multiple
    name="modal"
  )

  .layout__wrap.overflow-hidden.flex-grow.h-full.flex
    transition(name="fadeIn" appear)
      Nuxt(
        keep-alive
        :keep-alive-props="{ include: keepAliveInclude }"
      )
</template>

<style lang="stylus">
@import '~assets/stylus/base/animations'
@import '~assets/stylus/index'
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
