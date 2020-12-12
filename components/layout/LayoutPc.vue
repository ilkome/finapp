<script>
export default {
  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    }
  },

  methods: {
    handleShowWalletModal (id) {
      this.$store.commit('wallets/showWalletModal')
      this.$store.commit('wallets/setWalletModalId', id)
    }
  }
}
</script>

<template lang="pug">
.layout
  .createTrnBtn(
    v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']"
    @click="$store.dispatch('trnForm/openTrnForm', { action: 'create' })"
  ): .mdi.mdi-plus

  //- modals
  CategoryModal
  CurrencyModal
  TrnForm(v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']")
  TrnModal
  WalletModal

  .layout__wrap
    .layout__item
      LayoutPcSidebar

    .layout__item
      //- Dashboard
      //------------------------------------------------
      transition(name="animation-tab")
        Dashboard

      //- Budgets
      //------------------------------------------------
      LayoutPcTab(:show="activeTab === 'budgets'")
        LazyBudgets(v-if="activeTab === 'budgets'")

      //- Groups
      //------------------------------------------------
      LayoutPcTab(:show="activeTab === 'groups'")
        LazyGroups(v-if="activeTab === 'groups'")

      //- categories
      //------------------------------------------------
      LayoutPcTab(:show="activeTab === 'categories'")
        ComponentWrap
          template(slot="headerLeft") {{ $t('categories.title') }}

          template(slot="content")
            CategoriesList.dashboardItems(
              @onClick="id => $store.dispatch('categories/showCategoryModal', id)"
            )

          template(slot="bottom")
            .col
              Button(
                className="_blue _inline"
                icon="mdi mdi-plus"
                :title="$t('categories.new')"
                @onClick="$store.dispatch('ui/setActiveTab', 'createCategory')")

      //- wallets
      //------------------------------------------------
      LayoutPcTab(:show="activeTab === 'wallets'")
        ComponentWrap
          template(slot="headerLeft") {{ $t('wallets.title') }}

          template(slot="content")
            WalletsList3.dashboardItems(
              @onClick="(id) => handleShowWalletModal(id)"
            )

          template(slot="bottom")
            .flex
              .col
                Button(
                  className="_inline _blue"
                  icon="mdi mdi-plus"
                  :title="$t('wallets.new')"
                  @onClick="$store.dispatch('ui/setActiveTab', 'createWallet')")
              .col
                Button(
                  className="_inline _blue"
                  :title="$t('base.sort')"
                  icon="mdi mdi-arrow-split-horizontal"
                  @onClick="$store.dispatch('ui/setActiveTab', 'walletsSort')")

      //- add category
      //------------------------------------------------
      LayoutPcTab(:show="activeTab === 'createCategory'")
        CategoryForm(v-if="activeTab === 'createCategory'")

      //- add wallet
      //------------------------------------------------
      LayoutPcTab(:show="activeTab === 'createWallet'")
        WalletForm(v-if="activeTab === 'createWallet'")

      //- wallets sort
      //------------------------------------------------
      LayoutPcTab(:show="activeTab === 'walletsSort'")
        WalletsSort(v-if="activeTab === 'walletsSort'")

      //- settings
      //------------------------------------------------
      LayoutPcTab(:show="activeTab === 'settings'")
        Settings

    .layout-formSideOpener(
      v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']"
      @click="$store.dispatch('trnForm/openTrnForm', { action: 'create' })"
    )
</template>

<style lang="stylus">
@import '~assets/stylus/variables/margins'

.component__content-main
  .walllets.dashboardItems
    padding 0

    .walllets__grid
      grid-template-columns repeat(3, 1fr)
      grid-column-gap $m8
      grid-row-gap $m8

    .walletItemGrid
      width 100%

      &__name
        padding-bottom $m6
        font-size 18px

      &__line
        height 6px
        margin-right (- $m8)
        // margin-bottom $m8
        margin-left (- $m8)

.dashboardItems .categoryItem
  padding $m8
</style>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.layoutBg
  z-index 1
  opacity .05
  position absolute
  top 0
  right 0
  display flex
  align-items center
  justify-content center
  height 100%
  font-size 1000px

.layout-formSideOpener
  z-index 2
  cursor pointer
  opacity .3
  position fixed
  top 0
  right 0
  width 50px
  height 100%
  anim-all()

  @media $media-xl
    width 180px
  @media $media-xl2
    width 400px

  &:hover
    background var(--c-bg-8)

.layout
  overflow hidden
  position relative
  min-height 100%

  &__wrap
    overflow hidden
    z-index 2
    position relative
    display grid
    min-height 100vh
    min-width 600px
    background var(--c-bg-2)
    grid-template-columns 280px 1fr

    @media $media-xl
      border-right 1px solid var(--c-bg-1)

  &__item
    overflow hidden
    position relative
    display grid

.dashboard
  &__title
    font-header-4()
    margin-bottom $mn2

.dashboardBl
  background var(--c-bg-5)

.dashboard__bl
  z-index 2
  position absolute
  width 100%
  height 100%

.createTrnBtn
  z-index 5
  cursor pointer
  position absolute
  right $m8
  bottom $m8
  display flex
  align-items center
  justify-content center
  width 60px
  height 60px
  padding $m7 $m8
  color var(--c-font-1)
  font-size 44px
  background var(--c-blue-1)
  border-radius 50%
  anim()

  &:hover
    transform scale(1.2)

.position
  position absolute
  top 0
  left 0
  display grid
  width 100%
  height 100%
</style>
