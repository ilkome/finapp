<script setup lang="ts">
import { usePointer } from '@vueuse/core'
import debounce from '~/utils/debounce'
import useUIView from '~/components/layout/useUIView'
import { useTrnForm, useTrnFormStore } from '~/components/trnForm/useTrnForm'

import '~/assets/css/index.css'
import '~/assets/css/themes.css'
import '~/assets/css/fullpage.css'
import '~/assets/css/reset.css'

const { $store } = useNuxtApp()
const $trnForm = useTrnFormStore()
const { trnFormCreate } = useTrnForm()

useLazyAsyncData('', async () => {
  const { initUI } = useUIView()
  await initUI()
})

const keepAliveInclude = [
  'pages/categories/index.vue',
  'pages/dashboard.vue',
  'pages/wallets/index.vue',
]

// TODO: Put in one separate setup function
const { pointerType } = usePointer()
const classes = computed(() => [
  {
    mouse: pointerType.value === 'mouse' || !pointerType.value,
    touch: pointerType.value === 'touch',
  },
  `
    overflow-hidden relative
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

useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Finapp` : 'Finapp'
  },
})
</script>

<template lang="pug">
div(:class="classes")
  LayoutModals

  PortalTarget(
    multiple
    name="modal"
  )

  .h-full.grid(
    class="lg_grid-cols-[auto_1fr]"
  )
    .hidden.overflow-hidden.h-full.w-72.lg_block
      LayoutSidebar

    .overflow-hidden.h-full.grid.lg_px-8
      Nuxt(keep-alive :keep-alive-props="{ include: keepAliveInclude }")

    .createTrn.hidden.z-10.absolute.right-6.bottom-6.lg_flex(
      @click="trnFormCreate"
    )
      .btn: .mdi.mdi-plus

    .firefoxBackdropFix.z-10.absolute.bottom-0.left-0.w-full.backdrop-blur.lg_hidden(
      class="bg-white/70 dark_bg-dark3/70"
    )
      LayoutMenuBottom
</template>

<style lang="stylus">
@import '~assets/stylus/index'

.createTrn
  cursor pointer
  align-items flex-end
  justify-content center
  anim()

  +media-hover()
    .btn
      transform scale(1.3)

  .btn
    display flex
    align-items center
    justify-content center
    width 48px
    height 48px
    color var(--c-font-1)
    font-size 32px
    background var(--c-blue-1)
    border-radius 50%
    anim()
</style>
