<script>
import Swiper from 'swiper'
import 'swiper/swiper-bundle.min.css'

export default {
  name: 'LayoutMobile',

  data () {
    return {
      slider: null,

      periods: [{
        slug: 'day',
        name: this.$t('dates.day.simple')
      }, {
        slug: 'week',
        name: this.$t('dates.week.simple')
      }, {
        slug: 'month',
        name: this.$t('dates.month.simple')
      }, {
        slug: 'year',
        name: this.$t('dates.year.simple')
      }]
    }
  },

  computed: {
    activeTab () {
      return this.$store.state.ui.activeTab
    },

    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
    },

    periodName () {
      return this.$store.state.filter.period
    }
  },

  mounted () {
    this.slider = this.slider = new Swiper(this.$refs.slider, {
      slidesPerView: 'auto',
      initialSlide: 1,
      resistanceRatio: 0,
      touchReleaseOnEdges: true,
      shortSwipes: false,
      longSwipesRatio: 0.1,
      longSwipesMs: 60
    })
  },

  methods: {
    clickHandler () {
      const index = this.slider.activeIndex
      index === 0 && this.slider.slideNext()
    },

    handleShowWalletModal (id) {
      this.$store.commit('wallets/showWalletModal')
      this.$store.commit('wallets/setWalletModalId', id)
    },

    changePeriod (period) {
      this.$store.dispatch('filter/setPeriod', period)
    }
  }
}
</script>

<template lang="pug">
.wrap
  .layoutMobile
    .layoutMobile__content
      .swiper-container(ref="slider")
        .swiper-wrapper
          //- Wallets
          .swiper-slide
            ComponentWrap(:contentPadding="false")
              template(slot="content")
                WalletsTotal
                WalletsList3(
                  :limit="6"
                  showToogle
                  @onClick="(id) => handleShowWalletModal(id)"
                )

              template(slot="bottom")
                .flex
                  .col
                    Button(
                      :title="$t('wallets.new')"
                      className="_inline _small"
                      @onClick="$store.dispatch('ui/setActiveTab', 'createWallet')"
                    )
                  .col
                    Button(
                      :title="$t('base.sort')"
                      className="_inline _small"
                      @onClick="$store.dispatch('ui/setActiveTab', 'walletsSort')"
                    )

          //- Stat
          //------------------------------------------------------------------------------
          .swiper-slide
            .page
              .page__wrap
                .page__nav
                  h1: Date

                  .page__summary
                    SummaryRow(
                      :incomesAmount="statCurrentPeriod.incomes.total"
                      :expensesAmount="statCurrentPeriod.expenses.total"
                    )

                .page__summary
                  //- Summary
                  //-----------------------------------------------------------
                  //- LazySummaryAverage(v-if="$store.state.ui.stat.averageStatVisibility === 'visible'")

                .page__content
                  .chartBar(v-show="$store.state.ui.statGraphsVisibility === 'visible'")
                    ChartMenu2
                    StatChartsLine

                  .switcher(:class="{ _round: $store.state.ui.statGraphsVisibility === 'hidden' }")
                    .switcher__content
                      .switcher__item._arrow(
                        v-if="$store.state.ui.statGraphsVisibility === 'hidden'"
                        :class="{ _disable: $store.state.filter.period === 'all' || $store.getters['stat/isLastPeriodSelected'] }"
                        @click="$store.dispatch('filter/setPeriodNext')"
                      ): .mdi.mdi-chevron-left

                      .switcher__item(
                        v-for="periodItem in periods"
                        :key="periodItem.slug"
                        :class="{ _active: $store.state.filter.period === periodItem.slug }"
                        @click="changePeriod(periodItem.slug)"
                      ) {{ periodItem.name }}

                      .switcher__item._arrow(
                        v-if="$store.state.ui.statGraphsVisibility === 'hidden'"
                        :class="{ _disable: $store.state.filter.period === 'all' || $store.getters['stat/isFirstPeriodSelected'] }"
                        @click="$store.dispatch('filter/setPeriodPrev')"
                      ): .mdi.mdi-chevron-right

                  StatMobile

          //- Categories
          .swiper-slide
            ComponentWrap(:contentPadding="false")
              template(slot="headerLeft") {{ $t('categories.name') }}

              template(slot="content")
                CategoriesList(
                  :style="{ paddingTop: '16px' }"
                  @onClick="(id) => $store.dispatch('categories/showCategoryModal', id)"
                )

              template(slot="bottom")
                .flex
                  .col
                    Button(
                      :title="$t('categories.new')"
                      className="_inline _small"
                      @onClick="$store.dispatch('ui/setActiveTab', 'createCategory')"
                    )

    .layoutMobile__menu
      LayoutMobileMenu(:slider="slider")

  //- Modals
  CategoryModal(:slider="slider")
  CurrencyModal
  TrnForm(v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']")
  TrnModal
  WalletModal(:slider="slider")
  CategoryStatModal

  Portal(
    v-if="activeTab === 'menu'"
    to="modal"
  )
    ModalBottom(
      key="menu"
      @onClose="$store.dispatch('ui/setActiveTab', 'stat')"
    )
      Menu

      .context-menu-sep

      ContextMenuItem(
        :title="$t('stat.customize.showPeriodsChart')"
        :showCheckbox="true"
        :checkboxValue="$store.state.ui.statGraphsVisibility === 'visible'"
        icon="mdi mdi-chart-bar-stacked"
        @onClick="$store.dispatch('ui/toogleShowStatGraphs')"
      )

      ContextMenuItem(
        :title="$t('stat.customize.averageStatVisibility')"
        :showCheckbox="true"
        :checkboxValue="$store.state.ui.stat.averageStatVisibility === 'visible'"
        icon="mdi mdi-chart-timeline"
        @onClick="$store.dispatch('ui/toogleAverageStatVisibility')"
      )

      ContextMenuItem(
        :title="$t('stat.customize.showCategorisChart')"
        :showCheckbox="true"
        :checkboxValue="$store.state.ui.catsChart === 'visible'"
        icon="mdi mdi-folder-star"
        @onClick="$store.dispatch('ui/toogleVisibleCatsChart')"
      )

      ContextMenuItem(
        :title="$t('stat.customize.showCategorisList')"
        :showCheckbox="true"
        :checkboxValue="$store.state.ui.statItems === 'visible'"
        icon="mdi mdi-chart-gantt"
        @onClick="$store.dispatch('ui/toogleVisibilityStatItems')"
      )

      .context-menu-sep

      ContextMenuItem(
        :title="$t('theme.change')"
        icon="mdi mdi-palette"
        @onClick="$store.dispatch('ui/changeTheme')"
      )

  //- Caegory Form: create or edit
  //------------------------------------------------------------------------------
  Portal(
    v-if="activeTab === 'createCategory'"
    to="modal"
  )
    ModalBottom(
      key="createCategory"
      @onClose="$store.dispatch('ui/setActiveTab', 'stat')"
    )
      CategoryForm

  //- Settings
  //------------------------------------------------------------------------------
  Portal(
    v-if="activeTab === 'settings'"
    to="modal"
  )
    ModalBottom(@onClose="$store.dispatch('ui/setActiveTab', 'stat')")
      Settings(v-if="activeTab === 'settings'")

  //- Wallet Form: create or edit
  //------------------------------------------------------------------------------
  Portal(
    v-if="activeTab === 'createWallet'"
    to="modal"
  )
    ModalBottom(
      :key="$store.state.wallets.editId"
      @onClose="$store.dispatch('ui/setActiveTab', 'stat')"
    )
      WalletForm

  //- Wallet Sort
  //------------------------------------------------------------------------------
  Portal(
    v-if="activeTab === 'walletsSort'"
    to="modal"
  )
    ModalBottom(
      @onClose="$store.dispatch('ui/setActiveTab', 'stat')"
    )
      template(#default="{ closeModal }")
        WalletsSort(
          v-if="activeTab === 'walletsSort'"
          @closeModal="closeModal"
        )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/scroll"

.page
  overflow hidden
  position relative
  width 100%
  height 100%

  &__nav
    overflow hidden
    z-index 100
    opacity .95
    position sticky
    top 0
    height 94px
    padding $m7
    background var(--c-bg-2)

  &__summary
    padding-top $m6

  &__wrap
    overflow hidden
    overflow-y auto
    scrollbar()
    position relative
    height 100%

    h1
      padding-bottom 0
      font-size 18px

  &__content
    padding 0 $m7

  &__customize
    z-index 20
    position absolute
    top $m5
    right $m7

.chartBar
  position relative
  margin 0 -8px
  padding 8px
  padding-top 0
  background var(--c-bg-3)
  border-left 1px solid var(--c-bg-4)
  border-right 1px solid var(--c-bg-4)
  border-radius 8px 8px 0 0

.switcher
  position relative
  display flex
  align-items center
  margin 0 -8px

  &._round
    overflow hidden
    border-radius 8px

  &._sb
    z-index 15
    justify-content space-between

  &__name
    flex-grow 1
    color var(--c-font-3)
    font-size 10px
    text-transform uppercase

  &__content
    overflow hidden
    display flex
    align-items stretch
    justify-content space-between
    background var(--c-bg-4)
    border-radius 0 0 8px 8px
    flex-grow 1

  &__item
    opacity .6
    flex-grow 1
    display flex
    align-items center
    justify-content center
    min-width 48px
    padding $m6 $m7
    font-size 12px
    text-align center
    border-radius $m9

    +media-hover()
      background var(--c-bg-3)

    &._arrow
      padding $m5 $m6
      font-size 18px

    &._active
      opacity 1
      background var(--c-bg-8)

    &._disable
      opacity .3

.block
  margin-bottom 8px
  background var(--c-bg-3)
  border-bottom 1px solid var(--c-bg-2)

.layoutMobile
  display grid
  grid-template-rows 1fr minmax(30px, min-content)
  height 100%
  background var(--c-bg-2)

  &__content
    overflow hidden

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
  z-index 10
  height 100%
  max-width 70vw
  background var(--c-bg-4)
  border-right 1px solid var(--c-bg-1)
  scrollbar()

.wrap
  overflow hidden
  position absolute
  top 0
  left 0
  width 100%
  height 100%
</style>
