<script>
import { computed, useContext } from '@nuxtjs/composition-api'
import useMobileLayout from '~/components/layout/useMobileLayout'
import useUIView from '~/components/layout/useUIView'

export default {
  name: 'LayoutMobileWrap',

  setup () {
    const { store } = useContext()

    // Layout
    const { isShowPeriodsNamesModal } = useMobileLayout()

    // UI
    const { ui } = useUIView()

    // Computed
    const activeTabViewName = computed(() => store.state.ui.activeTabViewName)
    const activeTab = computed(() => store.state.ui.activeTab)
    const activeTabStat = computed(() => store.state.ui.activeTabStat)
    const isStatPage = computed(() => activeTabViewName.value === 'stat')
    const statCurrentPeriod = computed(() => store.getters['stat/statCurrentPeriod'])
    const statAverage = computed(() => store.getters['stat/statAverage'])

    const className = computed(() => ({
      _stat: !!isStatPage.value,
      [`_${activeTabViewName.value}`]: true
    }))

    return {
      isShowPeriodsNamesModal,

      ui,

      activeTabViewName,
      activeTab,
      activeTabStat,
      isStatPage,
      statCurrentPeriod,
      statAverage,

      className
    }
  }
}
</script>

<template lang="pug">
.layoutMobile(:class="className")
  .layoutMobile__content
    //- Stat
    .page(
      v-if="isStatPage && $store.getters['trns/hasTrns']"
    ): StatMobile

    //- No trns
    .page(
      v-if="isStatPage && !$store.getters['trns/hasTrns']"
    ): StatNoStatActions

    //- Categories
    .page(
      v-show="activeTabViewName === 'categories'"
      :style="{ zIndex: activeTabViewName === 'categories' ? 10 : 0 }"
    ): LayoutIndexCategories

    //- Wallets
    .page(
      v-show="activeTabViewName === 'wallets'"
      :style="{ zIndex: activeTabViewName === 'wallets' ? 10 : 0 }"
    ): WalletsPageMobile

  //- Menu
  //-----------------------------------
  .layoutMobile__menu
    LayoutMobileStatMenu
    LayoutMobileBottomMenu

  //- Modals
  //-----------------------------------
  CategoriesModalCategoryModal
  CurrenciesCurrencyModal
  TrnForm(
    v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']"
    :isShow="$store.state.trnForm.show"
  )
  TrnsModalTrnModal
  WalletsModalWalletModal

  //- Dates
  LazyStatDateSelectorModal(v-if="isShowPeriodsNamesModal")

  //- Base Menu
  LazyLayoutMobileMenuModal(v-if="activeTab === 'menu'")

  //- Caegory Form: create or edit
  Portal(
    v-if="activeTab === 'createCategory'"
    to="modal"
  )
    ModalBottom(
      key="createCategory"
      @onClose="$store.dispatch('ui/setActiveTab', 'stat')"
    )
      CategoriesFormCategoryForm

  //- Settings
  Portal(
    v-if="activeTab === 'settings'"
    to="modal"
  )
    ModalBottom(@onClose="$store.dispatch('ui/setActiveTab', 'stat')")
      Settings(v-if="activeTab === 'settings'")

  //- Wallet Form: create or edit
  Portal(
    v-if="activeTab === 'createWallet'"
    to="modal"
  )
    ModalBottom(
      :key="$store.state.wallets.editId"
      @onClose="$store.dispatch('ui/setActiveTab', 'stat')"
    )
      WalletsFormWalletForm

  //- Wallet Sort
  Portal(
    v-if="activeTab === 'walletsSort'"
    to="modal"
    key="walletsSort"
  )
    ModalBottom(
      isShow
      key="walletsSort"
      @onClose="$store.dispatch('ui/setActiveTab', 'stat')"
    )
      template(#default="{ closeModal }")
        WalletsSort(
          v-if="activeTab === 'walletsSort'"
          @closeModal="closeModal"
        )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.layoutMobile
  flex-grow 1
  display grid
  height 100%
  padding-bottom 44px

  &._stat
    padding-bottom 80px

  &__content
    overflow hidden

  &__menu
    z-index 10
    position fixed
    left 0
    bottom 0
    width 100%
    transition all .3s ease

.page
  overflow hidden
  overflowScrollY()
  display grid
  height 100%
  max-width 900px
  margin 0 auto
  padding 0
  background var(--color-bg-canvas)
</style>
