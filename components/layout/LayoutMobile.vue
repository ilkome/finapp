<script>
import Swiper from 'swiper'
import 'swiper/swiper-bundle.min.css'

export default {
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
      this.$store.commit('wallets/showWalletModal')
      this.$store.commit('wallets/setWalletModalId', id)
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
        Menu(@onClickMenuCalback="slider.slideNext()")
        .block
          WalletsTotal
        .menu__wallets
          WalletsList(:limit="6")

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
                    template(slot="content")
                      WalletsTotal
                      WalletsList(
                        @onClick="(id) => handleShowWalletModal(id)"
                      )

                    template(slot="bottom")
                      .flex
                        .col
                          Button(
                            className="_inline _small"
                            :title="$lang.wallets.new"
                            @onClick="$store.dispatch('ui/setActiveTab', 'createWallet')")
                        .col
                          Button(
                            className="_inline _small"
                            :title="$lang.base.sort"
                            @onClick="$store.dispatch('ui/setActiveTab', 'walletsSort')")

              //- wallets sort
              transition(name="animation-tab")
                .tab(v-if="activeTab === 'walletsSort'")
                  WalletsSort

              //- categories
              transition(name="animation-tab")
                .tab(v-show="activeTab === 'categories'")
                  ComponentWrap(:contentPadding="false")
                    template(slot="headerLeft") {{ $lang.categories.name }}

                    template(slot="content")
                      CategoriesList(
                        :style="{ paddingTop: '16px' }"
                        @onClick="(id) => $store.dispatch('categories/showCategoryModal', id)")

                    template(slot="bottom")
                      Button(
                        className="_inline _small"
                        :title="$lang.categories.new"
                        @onClick="$store.dispatch('ui/setActiveTab', 'createCategory')")

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
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/scroll"

.block
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
