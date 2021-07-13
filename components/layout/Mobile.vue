<script>
import { computed, useContext } from '@nuxtjs/composition-api'
import useMobileLayout from '~/components/layout/useMobileLayout'
import useUIView from '~/components/layout/useUIView'

export default {
  name: 'LayoutWrap',

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
.layout(:class="className")
  .layout__sidebar
    LayoutPcSidebar

  .layout__content
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

    //- Analytics
    //-----------------------------
    template(v-if="activeTabViewName === 'analytics'")
      .pageAnalytics
        Analytics
          template(#incomes)
            .boxTitle {{ $t('money.incomes') }}

            .boxSummary2
              .boxSummary2__item
                Amount(
                  :currency="$store.state.currencies.base"
                  :type="1"
                  :value="statCurrentPeriod.incomes.total"
                  size="xl"
                  vertical="left"
                )
              StatSummaryRowItemView(
                :type="1"
                :amount="statAverage.incomes"
                :title="$t('money.average.incomes')"
              )

          template(#expenses)
            .boxTitle {{ $t('money.expenses') }}

            .boxSummary2
              .boxSummary2__item
                Amount(
                  :currency="$store.state.currencies.base"
                  :type="0"
                  :value="statCurrentPeriod.expenses.total"
                  size="xl"
                  vertical="left"
                )
              StatSummaryRowItemView(
                :type="0"
                :amount="statAverage.expenses"
                :title="$t('money.average.expenses')"
              )

  //- Menu
  //-----------------------------------
  .layout__menu
    LayoutMobileBottomMenu

  //- Modals
  //-----------------------------------
  CategoriesModalCategoryModal
  CurrenciesCurrencyModal

  BaseBottomSheet(
    keepAlive
    :show="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories'] && $store.state.trnForm.show"
    @closed="$store.dispatch('trnForm/closeTrnForm')"
  )
    template(#handler="{ close }")
      .handler

      .handler__close(@click="close")
        svg(
          viewBox='0 0 24 24'
          fill='none'
          stroke='#000'
          stroke-linecap='round'
          stroke-linejoin='round'
          stroke-width='1.5'
        )
          path(d='M.75 23.249l22.5-22.5')
          path(d='M23.25 23.249L.75.749')

    TrnForm(:show="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories'] && $store.state.trnForm.show")

  TrnsModalTrnModal
  WalletsModalWalletModal

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

.layout
  flex-grow 1
  display grid
  grid-template-columns 1fr
  grid-template-rows 1fr minmax(auto, auto)
  height 100%
  background var(--c-bg-2)

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

  &__menu
    background var(--c-bg-3)

    +media(600px)
      background var(--c-bg-2)

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

  &__close
    z-index 3
    cursor pointer
    position absolute
    top 4px
    right 4px
    display flex
    align-items center
    justify-content center
    width 40px
    height 40px
    border-radius 50%
    anim()

    +media-hover()
      background var(--c-blue-1)

    svg
      anim()
      width 12px
      height 12px
      stroke var(--c-font-4)

    +media-hover()
      svg
        width 12px
        height 12px
        stroke var(--c-font-1)

.page
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
