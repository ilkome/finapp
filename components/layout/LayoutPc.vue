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
  .createTrnBtn(@click="$store.dispatch('trnForm/openTrnForm', { action: 'create' })"): .mdi.mdi-plus

  //- modals
  CategoryModal
  CurrencyModal
  TrnForm
  TrnModal
  WalletModal

  .layout__wrap
    .layout__item
      LayoutPcSidebar

    .layout__item
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
          template(slot="headerLeft") {{ $lang.categories.title }}

          template(slot="content")
            CategoriesList.dashboardItems(
              @onClick="id => $store.dispatch('categories/showCategoryModal', id)")

          template(slot="bottom")
            .col
              Button(
                className="_blue _inline"
                icon="mdi mdi-plus"
                :title="$lang.categories.new"
                @onClick="$store.dispatch('ui/setActiveTab', 'createCategory')")

      //- wallets
      //------------------------------------------------
      LayoutPcTab(:show="activeTab === 'wallets'")
        ComponentWrap
          template(slot="headerLeft") {{ $lang.wallets.title }}

          template(slot="content")
            WalletsList.dashboardItems(
              ui="tile"
              @onClick="(id) => handleShowWalletModal(id)")

          template(slot="bottom")
            .flex
              .col
                Button(
                  className="_inline _blue"
                  icon="mdi mdi-plus"
                  :title="$lang.wallets.new"
                  @onClick="$store.dispatch('ui/setActiveTab', 'createWallet')")
              .col
                Button(
                  className="_inline _blue"
                  :title="$lang.base.sort"
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
@import "~assets/stylus/variables/margins"

.dashboardItems .categoryItem
.dashboardItems .walletItemTile
  padding $m8
</style>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.layoutBg
  z-index 1
  position absolute
  top 0
  right 0
  opacity .05
  font-size 1000px
  height 100%
  display flex
  align-items center
  justify-content center

.layout-formSideOpener
  cursor pointer
  opacity .3
  z-index 2
  position fixed
  right 0
  top 0
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
  position relative
  overflow hidden
  min-height 100%

  &__wrap
    overflow hidden
    position relative
    z-index 2
    min-height 100vh
    display grid
    grid-template-columns 280px 1fr
    min-width 600px
    background var(--c-bg-2)

    @media $media-xl
      border-right 1px solid var(--c-bg-1)

  &__item
    position relative
    display grid
    overflow hidden

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
  cursor pointer
  z-index 5
  display flex
  align-items center
  justify-content center
  position absolute
  right $m8
  bottom $m8
  padding $m7 $m8
  width 60px
  height 60px
  font-size 44px
  color var(--c-font-1)
  background var(--c-blue-1)
  border-radius 50%
  anim()

  &:hover
    transform scale(1.2)

.position
  display grid
  position absolute
  left 0
  top 0
  width 100%
  height 100%
</style>
