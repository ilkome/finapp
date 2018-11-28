<script>
import Button from '@/components/shared/button/Button'
import CategoriesList from '@/components/categories/list/CategoriesList'
import CategoryForm from '@/components/categories/form/CategoryForm'
import CategoryModal from '@/components/categories/modal/CategoryModal'
import Dashboard from '@/components/dashboard/Dashboard'
import DashboardNav from '@/components/dashboard/DashboardNav'
import LayoutPcTab from '@/components/layout/LayoutPcTab'
import LayoutPcSidebar from '@/components/layout/LayoutPcSidebar'
import Settings from '@/components/settings/Settings'
import TrnForm from '@/components/trnForm/TrnForm'
import TrnModal from '@/components/trns/modal/TrnModal'
import TrnsList from '@/components/trns/list/TrnsList'
import WalletForm from '@/components/wallets/form/WalletForm'
import WalletModal from '@/components/wallets/modal/WalletModal'
import WalletsList from '@/components/wallets/list/WalletsList'

export default {
  components: {
    Button,
    CategoriesList,
    CategoryForm,
    CategoryModal,
    Dashboard,
    DashboardNav,
    LayoutPcTab,
    LayoutPcSidebar,
    Settings,
    TrnForm,
    TrnModal,
    TrnsList,
    WalletForm,
    WalletModal,
    WalletsList
  },

  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    }
  },

  methods: {
    handleShowCategoryModal (id) {
      this.$store.commit('showCategoryModal')
      this.$store.commit('setCategoryModalId', id)
    },
    handleShowWalletModal (id) {
      this.$store.commit('showWalletModal')
      this.$store.commit('setWalletModalId', id)
    }
  }
}
</script>

<template lang="pug">
.layout
  .layout-formSideOpener(@click="$store.dispatch('openTrnForm', { action: 'create' })")
  .createTrnBtn(@click="$store.dispatch('openTrnForm', { action: 'create' })"): .mdi.mdi-library-plus

  //- modals
  CategoryModal
  TrnForm
  TrnModal
  WalletModal

  .layout__wrap
    .layout__item
      LayoutPcSidebar

    .layout__item
      Dashboard
        transition(name="slide")
          .trnsHistory(v-if="$store.state.dashboard.showTrnsHistory")
            .dashboard__title History
            TrnsList

      LayoutPcTab(:show="activeTab === 'categories'")
        .dashboard__title Categories
        CategoriesList.dashboardItems(v-on:onClick="(id) => handleShowCategoryModal(id)")
        Button(
          className="_blue _inline"
          icon="mdi mdi-plus"
          title="New category"
          v-on:onClick="$store.dispatch('setActiveTab', 'createCategory')")

      LayoutPcTab(:show="activeTab === 'wallets'")
        .dashboard__title Wallets
        WalletsList(
          ui="tile"
          v-on:onClick="(id) => handleShowWalletModal(id)")
        Button(
          className="_blue _inline"
          icon="mdi mdi-plus"
          title="New wallet"
          v-on:onClick="$store.dispatch('setActiveTab', 'createWallet')")

      LayoutPcTab(:show="activeTab === 'createCategory'")
        CategoryForm(v-if="activeTab === 'createCategory'")

      LayoutPcTab(:show="activeTab === 'createWallet'")
        WalletForm(v-if="activeTab === 'createWallet'")

      LayoutPcTab(:show="activeTab === 'settings'")
        Settings
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/animations"
@import "~@/stylus/mixins/animations"
@import "~@/stylus/variables/scrollbar"

.layout-formSideOpener
  opacity .3
  z-index 3
  position fixed
  right 0
  top 0
  width 30px
  height 100%
  anim-all()

  @media $media-xl
    z-index 2
    width 100%

  &:hover
    background var(--c-bg-8)

.layout
  position relative
  overflow hidden
  height 100%
  max-width 1500px

  &__wrap
    overflow hidden
    position relative
    z-index 2
    height 100%
    display grid
    grid-template-columns minMax(280px, 320px) 1fr
    max-width 1500px
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

.trnsHistory
  padding 0 $mb2
  padding-top $mb2
  padding-bottom $mn2

  .trnsList
    display grid
    grid-template-columns repeat(3, 1fr)
    grid-column-gap $m7
    grid-row-gap $m7

.createTrnBtn
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
  color var(--c-font-1)
  background var(--c-bg-4)
  border-radius 50%
  font-size 18px
  color var(--c-font-4)
  anim()

  &:hover
    color var(--c-font-1)
    background var(--c-blue-1)
</style>
