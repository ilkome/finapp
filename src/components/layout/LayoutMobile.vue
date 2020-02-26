<script>
import { Swiper } from 'swiper/dist/js/swiper.esm.js'
import 'swiper/dist/css/swiper.min.css'

import Budgets from '@/components/budgets/Budgets'
import Button from '@/components/shared/button/Button'
import CategoriesList from '@/components/categories/list/CategoriesList'
import CategoryForm from '@/components/categories/form/CategoryForm'
import CategoryModal from '@/components/categories/modal/CategoryModal'
import ComponentWrap from '@/components/layout/component/Component'
import CurrencyModal from '@/components/currencies/CurrencyModal'
import Groups from '@/components/groups/Groups'
import LayoutMobileMenu from '@/components/layout/LayoutMobileMenu'
import LayoutMobileStat from '@/components/layout/LayoutMobileStat'
import Menu from '@/components/layout/sidebar/Menu'
import Projects from '@/components/projects/Projects'
import Settings from '@/components/settings/Settings'
import TrnForm from '@/components/trnForm/TrnForm'
import TrnModal from '@/components/trns/modal/TrnModal'
import TrnsList from '@/components/trns/list/TrnsList'
import WalletForm from '@/components/wallets/form/WalletForm'
import WalletModal from '@/components/wallets/modal/WalletModal'
import WalletsList from '@/components/wallets/list/WalletsList'
import WalletsSort from '@/components/wallets/sort/WalletsSort'
import WalletsTotal from '@/components/wallets/total/WalletsTotal'

export default {
  components: {
    Budgets,
    Button,
    CategoriesList,
    CategoryForm,
    CategoryModal,
    ComponentWrap,
    CurrencyModal,
    Groups,
    LayoutMobileMenu,
    LayoutMobileStat,
    Menu,
    Projects,
    Settings,
    TrnForm,
    TrnModal,
    TrnsList,
    WalletForm,
    WalletModal,
    WalletsList,
    WalletsSort,
    WalletsTotal
  },

  data () {
    return {
      slider: null
    }
  },

  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    }
  },

  mounted () {
    this.slider = this.slider = new Swiper(this.$refs.slider, {
      slidesPerView: 'auto',
      initialSlide: 1,
      resistanceRatio: 0,
      touchReleaseOnEdges: true
    })
  },

  methods: {
    handleShowWalletModal (id) {
      this.$store.commit('showWalletModal')
      this.$store.commit('setWalletModalId', id)
    },

    clickHandler () {
      const index = this.slider.activeIndex
      index === 0 && this.slider.slideNext()
    }
  }
}
</script>

<template lang="pug">
.wrap
  .swiper-container(ref="slider")
    .swiper-wrapper
      .swiper-slide._sidebar
        .block
          WalletsTotal
        Menu(v-on:onClickMenuCalback="() => this.slider.slideNext()")

      .swiper-slide._static
        .handler(@click="clickHandler")

        .layoutMobile
          //------------------------------------------------
          //- content
          //------------------------------------------------
          .layoutMobile__content
            .tabs.swiper-no-swiping
              //- wallets
              transition(name="animation-tab")
                .tab(v-show="activeTab === 'wallets'")
                  ComponentWrap(:contentPadding="false")
                    template(slot="header")
                      WalletsTotal

                    template(slot="content")
                      WalletsList(
                        :limit="6"
                        :showToogle="true"
                        :style="{ paddingTop: '8px' }"
                        v-on:onClick="(id) => handleShowWalletModal(id)")

                    template(slot="bottom")
                      .flex
                        .col
                          Button(
                            className="_inline _small"
                            :title="$lang.wallets.new"
                            v-on:onClick="$store.dispatch('setActiveTab', 'createWallet')")
                        .col
                          Button(
                            className="_inline _small"
                            :title="$lang.base.sort"
                            v-on:onClick="$store.dispatch('setActiveTab', 'walletsSort')")

              //- wallets sort
              transition(name="animation-tab")
                .tab(v-if="activeTab === 'walletsSort'")
                  walletsSort

              //- categories
              transition(name="animation-tab")
                .tab(v-show="activeTab === 'categories'")
                  ComponentWrap(:contentPadding="false")
                    template(slot="headerLeft") {{ $lang.categories.name }}

                    template(slot="content")
                      CategoriesList(
                        :style="{ paddingTop: '16px' }"
                        v-on:onClick="(id) => $store.dispatch('showCategoryModal', id)")

                    template(slot="bottom")
                      Button(
                        className="_inline _small"
                        :title="$lang.categories.new"
                        v-on:onClick="$store.dispatch('setActiveTab', 'createCategory')")

              //- stat
              transition(name="animation-tab")
                .tab(v-show="activeTab === 'stat'")
                  LayoutMobileStat

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

              transition(name="animation-tab")
                .tab(v-if="activeTab === 'groups'")
                  Groups

              transition(name="animation-tab")
                .tab(v-if="activeTab === 'budgets'")
                  Budgets

              transition(name="animation-tab")
                .tab(v-if="activeTab === 'projects'")
                  Projects

          //------------------------------------------------
          //- menu
          //------------------------------------------------
          .layoutMobile__menu
            LayoutMobileMenu

  //- modals
  CategoryModal
  CurrencyModal
  TrnForm
  TrnModal
  WalletModal
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/animations"
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/scrollbar"

.block
  padding 16px
  margin-bottom 8px
  background var(--c-bg-3)
  border-bottom 1px solid var(--c-bg-2)

.layoutMobile
  display grid
  grid-template-rows 1fr minmax(30px, min-content)
  height 100%

.handler
  z-index 200
  position absolute
  left 0
  top 0
  width 100%
  height 100%
  background alpha(#000, .9)
  transition background 250ms

.swiper-slide-active
  .handler
    width 16px
    background none
    transition background 0ms

.swiper-container
  height 100%

._sidebar
  overflow hidden
  overflow-y auto
  scrollbar()
  z-index 10
  max-width 70vw
  height 100%
  background var(--c-bg-4)
  border-right 1px solid var(--c-bg-1)

.wrap
  position absolute
  left 0
  top 0
  width 100%
  height 100%
  overflow hidden

.tabs
  overflow hidden
  position relative
  width 100%
  max-width 620px
  height 100%
  margin 0 auto
  background var(--c-bg-2)

.tab
  overflow-x hidden
  overflow-y scroll
  scrollbar()
  position absolute
  left 0
  top 0
  width 100%
  height 100%

  &._padding-top
    // padding-top $m7
</style>
