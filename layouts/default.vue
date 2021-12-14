<script>
import { ref, computed, useContext, useFetch, onMounted } from '@nuxtjs/composition-api'
import useBaseLayout from '~/components/layout/useBaseLayout'
import debounce from '~/utils/debounce'
import detectTouch from '~/assets/js/isTouchDevice'
import useUIView from '~/components/layout/useUIView'

export default {
  name: 'DefaultLayout',

  setup () {
    const { store } = useContext()

    useFetch(async () => {
      const { initUI } = useUIView()
      await initUI()
    })

    const keepAliveInclude = ['IndexPage2']

    // Layout
    const { isShowPeriodsNamesModal } = useBaseLayout()

    // UI
    const { ui } = useUIView()

    const statCurrentPeriod = computed(() => store.getters['stat/statCurrentPeriod'])

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

    /**
     * Detect touch device
     */
    const isTouchDevice = ref(false)
    onMounted(() => { isTouchDevice.value = detectTouch() })

    /**
     * Page dimensions
     */
    function getPageDimensions () {
      const width = document.documentElement.clientWidth
      const height = document.documentElement.clientHeight
      document.documentElement.style.setProperty('--height', height + 'px')
      store.dispatch('ui/setAppDimensions', { width, height })
    }

    const className = computed(() => ({
      isNotTouchDevice: !isTouchDevice.value,
      isTouchDevice: isTouchDevice.value
    }))

    onMounted(() => {
      getPageDimensions()
      window.addEventListener('resize', debounce(getPageDimensions, 300))
    })

    return {
      keepAliveInclude,
      isShowPeriodsNamesModal,
      ui,
      statCurrentPeriod,
      className,
      isShowUpdateApp
    }
  }
}
</script>

<template lang="pug">
.overflow-hidden.relative.flex.h-full.min-w-base(:class="className")
  LayoutModals

  PortalTarget(
    multiple
    name="modal"
  )

  LazyAppUpdateAppModal(
    v-if="isShowUpdateApp"
    @onClose="isShowUpdateApp = false"
  )

  .layout__wrap
    .layout__sidebar
      LayoutSidebar

    .layout__content
      transition(name="fadeInSlow" appear)
        Nuxt(keep-alive :keep-alive-props="{ include: keepAliveInclude }")

    .layout__menu
      LayoutBottomMenu
</template>

<style lang="stylus">
@import '~assets/stylus/index'
@import '~assets/stylus/reset'
@import '~assets/stylus/colors-dark'
@import '~assets/stylus/colors-light'
</style>

<style lang="stylus" scoped>
.layout
  &__wrap
    flex-grow 1
    overflow hidden
    display grid
    grid-template-columns 1fr
    grid-template-rows 1fr minmax(auto, auto)
    height 100%

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
