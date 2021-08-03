<script>
import { ref, computed, useContext, useFetch, onMounted } from '@nuxtjs/composition-api'
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

    const className = computed(() => ({
      isNotTouchDevice: !isTouchDevice.value,
      isTouchDevice: isTouchDevice.value
    }))

    /**
     * Is production
     */
    const isProduction = process.env.NODE_ENV === 'production'

    /**
     * Page dimensions
     */
    function getPageDimensions () {
      const width = document.documentElement.clientWidth
      const height = document.documentElement.clientHeight
      document.documentElement.style.setProperty('--height', height + 'px')
      store.dispatch('ui/setAppDimensions', { width, height })
    }

    onMounted(() => {
      getPageDimensions()
      window.addEventListener('resize', debounce(getPageDimensions, 300))
    })

    return {
      isShowUpdateApp,
      className,
      isProduction
    }
  }
}
</script>

<template lang="pug">
.layout(:class="className")
  //- Loading
  template(v-if="!$store.state.app.status.ready")
    LoaderSharedLoader

  //- Continue to app
  transition(name="fadeInSlow" appear)
    template(v-show="$store.state.app.status.ready && !$fetchState.pending")
      Nuxt

  //- Notifications
  Notifications(
    :position="$store.state.ui.mobile ? 'top center' : 'top left'"
    :width="$store.state.ui.mobile ? '94%' : '380px'"
    classes="notifications"
  )

  //- Modals
  PortalTarget(
    multiple
    name="modal"
  )

  //- Update modal
  LazyAppUpdateAppModal(
    v-if="isShowUpdateApp"
    @onClose="isShowUpdateApp = false"
  )

  //- Metrica
  LazyMetrica(v-if="isProduction")
</template>

<style lang="css">
:root {
  --height: 100vh
}
</style>

<style lang="stylus">
@import '~assets/stylus/variables'
</style>
