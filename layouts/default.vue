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
.overflow-hidden.relative.h-full.min-w-base.font-roboto.text-slate-500.dark_text-gray-400.leading-none.antialiased.bg-white.dark_bg-dark3(
  :class="touchClassNames"
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

  .h-full.grid(
    class="lg_grid-cols-[auto_1fr]"
  )
    .hidden.lg_block
      LayoutSidebar

    .overflow-hidden.h-full.lg_px-8.grid
      Nuxt(keep-alive :keep-alive-props="{ include: keepAliveInclude }")
      .absolute.right-0.bottom-0.w-full

      .hidden.createTrn.absolute.right-6.bottom-6.lg_flex(
        @click="$store.dispatch('trnForm/openTrnForm', { action: 'create' })"
      )
        .btn: .mdi.mdi-plus

    .firefoxBackdropFix.z-10.absolute.bottom-0.left-0.w-full.backdrop-blur.lg_hidden(
      class="bg-white/70 dark_bg-dark3/70"
    )
      LayoutMenuBottom
</template>

<style lang="stylus">
@import '~assets/stylus/index'
@import '~assets/stylus/colors-dark'
@import '~assets/stylus/colors-light'

.firefoxBackdropFix
  @supports (not (-webkit-backdrop-filter: none)) and (not (backdrop-filter: none))
    background theme('colors.dark3') !important
    /.light &
      background theme('colors.white') !important

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
