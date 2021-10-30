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

    // Computed
    const activeTab = computed(() => store.state.ui.activeTab)
    const statCurrentPeriod = computed(() => store.getters['stat/statCurrentPeriod'])
    const statAverage = computed(() => store.getters['stat/statAverage'])

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
      activeTab,
      statCurrentPeriod,
      statAverage,
      className,
      isShowUpdateApp
    }
  }
}
</script>

<template lang="pug">
.layoutNew(:class="className")
  .layoutNew__modals
    //- trn: form
    BaseBottomSheet(
      keepAlive
      :show="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories'] && $store.state.trnForm.show"
      @closed="$store.dispatch('trnForm/closeTrnForm')"
    )
      template(#handler="{ close }")
        .handler
        BaseBottomSheetClose(@onClick="close")
      TrnForm(:show="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories'] && $store.state.trnForm.show")

    //- trn: item
    TrnsModal

    //- menu
    LazyLayoutMenuModal(v-if="activeTab === 'menu'")

    //- currencies
    CurrenciesModal

    //- category: item
    CategoriesModal

    //- category: create or edit
    LazyCategoriesEditModal(v-if="activeTab === 'createCategory'")

    //- settings
    Portal(v-if="activeTab === 'settings'" to="modal")
      ModalBottom(@onClose="$store.dispatch('ui/setActiveTab', null)")
        Settings(v-if="activeTab === 'settings'")

    //- wallet item
    WalletsModal

    //- wallet: create or edit
    Portal(v-if="activeTab === 'createWallet'" to="modal")
      ModalBottom(
        :key="$store.state.wallets.editId"
        @onClose="$store.dispatch('ui/setActiveTab', null)"
      )
        WalletsFormWalletForm(
          @callback="$store.dispatch('ui/setActiveTab', null)"
        )

    //- wallet: sort
    Portal(v-if="activeTab === 'walletsSort'" to="modal" key="walletsSort")
      ModalBottom(
        isShow
        key="walletsSort"
        @onClose="$store.dispatch('ui/setActiveTab', null)"
      )
        template(#default="{ closeModal }")
          WalletsSort(
            v-if="activeTab === 'walletsSort'"
            @closeModal="closeModal"
          )

    //- loading
    template(v-if="!$store.state.app.status.ready")
      LoaderSharedLoader

    //- notifications
    Notifications(
      :max="2"
      :position="$store.state.ui.width < 600 ? 'top center' : 'top center'"
      :width="$store.state.ui.width < 600 ? '94%' : '380px'"
      classes="notifications"
    )

    //- portal
    PortalTarget(
      multiple
      name="modal"
    )

    //- update app
    LazyAppUpdateAppModal(
      v-if="isShowUpdateApp"
      @onClose="isShowUpdateApp = false"
    )

  //- wrap
  //-----------------------------------
  .layoutNew__wrap
    .layoutNew__sidebar
      LayoutSidebar

    .layoutNew__content
      .page2
        Nuxt(keep-alive :keep-alive-props="{ include: keepAliveInclude }")

    .layoutNew__menu
      LayoutBottomMenu
</template>

<style lang="stylus">
@import '~assets/stylus/base'
</style>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.layoutNew
  overflow hidden
  position relative
  display flex
  height 100%
  background var(--c-bg-3)

  &__modals
    height 0

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
    position relative
    display grid
    height 100%

  &__menu
    background var(--c-bg-3)

    +media(1200px)
      display none

.handler
  z-index 2
  position absolute
  top 0
  left 0
  display flex
  align-items center
  justify-content center
  width 100%
  height 16px

  &:after
    content ''
    display block
    width 32px
    height 4px
    background var(--c-bg-8)
    border-radius 4px

.page2
  overflow hidden
  overflowScrollY()
  display grid
  height 100%
  max-width 1100px
  padding 0
  background var(--color-bg-canvas)

  +media(800px)
    padding 0 32px

  +media(1000px)
    padding 0 64px
</style>
