<script>
import CategoriesList from '@/components/categories/list/CategoriesList'
import CategoryForm from '@/components/categories/form/CategoryForm'
import CategoryModal from '@/components/categories/modal/CategoryModal'
import FilterModal from '@/components/filter/FilterModal'
import LayoutMobileMenu from '@/components/layout/LayoutMobileMenu'
import Settings from '@/components/settings/Settings'
import StatChartDonut from '@/components/stat/StatChartDonut'
import StatChartsLine from '@/components/stat/StatChartsLine'
import StatMobile from '@/components/stat/StatMobile'
import TrnForm from '@/components/trnForm/TrnForm'
import TrnModal from '@/components/trns/modal/TrnModal'
import TrnsList from '@/components/trns/list/TrnsList'
import WalletForm from '@/components/wallets/form/WalletForm'
import WalletModal from '@/components/wallets/modal/WalletModal'
import WalletsList from '@/components/wallets/list/WalletsList'
import WalletsTotal from '@/components/wallets/total/WalletsTotal'

export default {
  components: {
    CategoriesList,
    CategoryForm,
    CategoryModal,
    FilterModal,
    LayoutMobileMenu,
    Settings,
    StatChartDonut,
    StatChartsLine,
    StatMobile,
    TrnForm,
    TrnModal,
    TrnsList,
    WalletForm,
    WalletModal,
    WalletsList,
    WalletsTotal
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
.tabs
  //- wallets
  transition(name="animation-tab")
    .tab(v-show="activeTab === 'wallets'")
      .tabPanel
        .tabPanel__top: WalletsTotal
        .tabPanel__scroll
          .wallets-list
            WalletsList(
              :showToogle="true"
              :limit="6"
              v-on:onClick="(id) => handleShowWalletModal(id)")

  //- categories
  transition(name="animation-tab")
    .tab._padding-top(v-show="activeTab === 'categories'")
      CategoriesList(v-on:onClick="(id) => handleShowCategoryModal(id)")

  //- stat
  transition(name="animation-tab")
    .tab(v-show="activeTab === 'stat'")
      WalletsList(
        v-if="$store.state.ui.stat.walletsVisibility === 'visible'"
        :limit="3"
        ui="widget"
        v-on:onClick="(id) => handleShowWalletModal(id)")
      StatChartsLine(
        v-if="$store.state.ui.statGraphsVisible && ($store.state.filter.period !== 'all')")
      StatMobile

  //- trns
  transition(name="animation-tab")
    .tab(v-if="activeTab === 'trns'")
      TrnsList

  //- Settings
  transition(name="animation-tab")
    .tab(v-if="activeTab === 'settings'")
      Settings

  //- create category
  transition(name="animation-tab")
    .tab(v-if="activeTab === 'createCategory'")
      CategoryForm

  //- create wallet
  transition(name="animation-tab")
    .tab(v-if="activeTab === 'createWallet'")
      WalletForm

  //- donut
  transition(name="animation-tab")
    .tab(v-if="activeTab === 'chart'")
      StatChartDonut

  LayoutMobileMenu

  //- modals
  CategoryModal
  FilterModal
  TrnForm
  TrnModal
  WalletModal
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"

.showDonut
  margin $m7
  padding $m7
  padding $m7 $m9
  color var(--c-font-1)
  background var(--c-blue-1)
  border-radius $m3

.wallets-list
  padding-top $m5

.tabs
  overflow hidden
  position relative
  width 100%
  height 100%
  background var(--c-bg-2)

.tab
  overflow-x hidden
  overflow-y scroll
  scrollbar()
  position absolute
  left 0
  top 0
  width 100%
  height calc(100vh - 120px)

  &._padding-top
    padding-top $m7
</style>
