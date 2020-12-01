<script>
export default {
  name: 'LayoutMobileWrap',

  data () {
    return {
      isShowModalMenu: false,
      isScrollInited: false,
      key: 0,
      headerBlockHeight: 0,
      period: 'daily',
      isShowPeriodsNames: false,

      periodsNames: [{
        slug: 'day',
        icon: 'mdi mdi-weather-sunset-up',
        name: this.$t('dates.day.simple')
      }, {
        slug: 'week',
        icon: 'mdi mdi-calendar-week',
        name: this.$t('dates.week.simple')
      }, {
        slug: 'month',
        icon: 'mdi mdi-calendar',
        name: this.$t('dates.month.simple')
      }, {
        slug: 'year',
        icon: 'mdi mdi-calendar-star',
        name: this.$t('dates.year.simple')
      }]
    }
  },

  computed: {
    activeTabViewName () {
      return this.$store.state.ui.activeTabViewName
    },

    activeTab () {
      return this.$store.state.ui.activeTab
    },

    activeTabStat () {
      return this.$store.state.ui.stat.activeTab
    },

    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
    },

    statAverage () {
      return this.$store.getters['stat/statAverage']
    },

    filterPeriod () {
      return this.$store.state.filter.period
    },

    isShowFilter () {
      return !!this.$store.state.filter.categoryId || !!this.$store.state.filter.walletId
    },

    periods () {
      return this.$store.state.chart.periods
    },

    periodsSummariesItems () {
      if (this.filterPeriod === 'all') { return }
      const values = {}
      for (let period = 0; period < this.$store.state.chart.periods[this.filterPeriod].showedPeriods; period++) {
        const periodStartDate = this.$day().subtract(period, this.filterPeriod).startOf('day')
        const trnsIds = this.$store.getters['trns/getTrns']({
          date: periodStartDate,
          periodName: this.filterPeriod
        })

        values[periodStartDate.valueOf()] = {
          date: periodStartDate.valueOf(),
          ...this.$store.getters['trns/getTotalOfTrnsIds'](trnsIds)
        }
      }

      return values
    },

    periodsSummariesTotal () {
      if (this.filterPeriod === 'all') { return }
      const total = {
        incomes: 0,
        expenses: 0,
        total: 0
      }

      for (const id in this.periodsSummariesItems) {
        total.incomes += this.periodsSummariesItems[id].incomes
        total.expenses += this.periodsSummariesItems[id].expenses
        total.total += this.periodsSummariesItems[id].total
      }

      return total
    }
  },

  mounted () {
    const headerBlock = document.querySelector('.pageScrollerJsHeader')
    if (headerBlock) {
      this.headerBlockHeight = `${headerBlock.clientHeight}px`
    }
  },

  methods: {
    onClickTopMenu (tabViewName) {
      this.$store.dispatch('ui/setActiveTabViewName', tabViewName)
      if (tabViewName === 'incomes' || tabViewName === 'expenses') {
        this.$store.dispatch('ui/setActiveTabStat', tabViewName)
      }
    },

    dayjs (value) {
      let format = 'MMM'
      if (this.filterPeriod === 'day') { format = 'DD.MM' }
      if (this.filterPeriod === 'week') { format = 'DD.MM' }
      if (this.filterPeriod === 'month') { format = 'MMMM' }
      if (this.filterPeriod === 'year') { format = 'YYYY' }

      return this.$day(value).format(format)
    },

    addPeriodToStat (periodName) {
      this.key = this.key + 1
      this.$store.commit('chart/addElementsToChart', { periodName, periodType: 'showedPeriods' })
      this.saveChartsPeriodsToLocalStorage()
    },

    removePeriodOfStat (periodName) {
      this.$store.commit('chart/removeElementsFromChart', { periodName, periodType: 'showedPeriods' })
      this.saveChartsPeriodsToLocalStorage()
    },

    saveChartsPeriodsToLocalStorage () {
      this.$store.dispatch('ui/saveUiView')
    },

    addPeriodOrGroup () {
      if (this.periods[this.filterPeriod].grouped) {
        this.$store.commit('chart/toogleChartPeriodView', { periodName: this.filterPeriod })
      }

      this.periods[this.filterPeriod].grouped
        ? this.$store.commit('chart/addElementsToChart', { periodName: this.filterPeriod, periodType: 'showedGroups' })
        : this.$store.commit('chart/addElementsToChart', { periodName: this.filterPeriod, periodType: 'showedPeriods' })
      this.saveChartsPeriodsToLocalStorage()
    },

    removePeriodOrGroup () {
      if (this.periods[this.filterPeriod].grouped) {
        this.$store.commit('chart/toogleChartPeriodView', { periodName: this.filterPeriod })
      }

      this.periods[this.filterPeriod].grouped
        ? this.$store.commit('chart/removeElementsFromChart', { periodName: this.filterPeriod, periodType: 'showedGroups' })
        : this.$store.commit('chart/removeElementsFromChart', { periodName: this.filterPeriod, periodType: 'showedPeriods' })
      this.saveChartsPeriodsToLocalStorage()
    },

    weekActiveStatus (date) {
      const filterDate = this.$store.state.filter.date
      const filterPeriod = this.$store.state.filter.period

      return this.$day(parseInt(date)).isSame(filterDate, filterPeriod)
    }
  }
}
</script>

<template lang="pug">
.layoutMobile
  .layoutMobile__content(ref="scroll")
    //- Categories
    //---------------------------------------------------------------------------
    template(v-if="activeTabViewName === 'categories'")
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

    //- Wallets
    //---------------------------------------------------------------------------
    template(v-if="activeTabViewName === 'wallets'")
      WalletsPageMobile

    //- Categories
    //---------------------------------------------------------------------------
    template(v-if="activeTabViewName === 'wallets'")
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

    //- Stat
    //---------------------------------------------------------------------------
    .page(v-show="activeTabViewName === 'chart' || activeTabViewName === 'incomes' || activeTabViewName === 'expenses' || activeTabViewName === 'history'")
      .page__content

        //- Daily & History
        //-----------------------------------------------------------------------
        .page__block.pageScrollerJsHeader
          .box._nobd.boxSwitcher
            .switcher2._bg
              .switcher2__item(
                :class="{ _active: activeTabViewName === 'chart' }"
                @click="onClickTopMenu('chart')"
              ) {{ $t('stat.periods') }}
              .switcher2__item(
                v-if="statAverage.incomes !== 0 || statCurrentPeriod.incomes.total !== 0"
                :class="{ _active: activeTabViewName === 'incomes' }"
                @click="onClickTopMenu('incomes')"
              ) {{ $t('money.incomes') }}
              .switcher2__item(
                v-if="statAverage.expenses !== 0 || statCurrentPeriod.expenses.total !== 0"
                :class="{ _active: activeTabViewName === 'expenses' }"
                @click="onClickTopMenu('expenses')"
              ) {{ $t('money.expenses') }}
              .switcher2__item(
                :class="{ _active: activeTabViewName === 'history' }"
                @click="onClickTopMenu('history')"
              ) {{ $t('trns.history') }}

        //- Chart Nav
        //-----------------------------
        .box._periods
          .periods
            .periodItem(
              v-if="filterPeriod !== 'all'"
              @click="removePeriodOrGroup"
            ): .mdi.mdi-minus

            .periodItem(
              v-for="periodItem in periodsNames"
              :key="periodItem.slug"
              :class="{ _active: $store.state.filter.period === periodItem.slug }"
              @click="$store.dispatch('filter/setPeriod', periodItem.slug)"
            )
              .periodItem__name {{ periodItem.name }}
              .periodItem__count(
                v-if="filterPeriod !== 'all'"
              ) {{ $store.state.chart.periods[periodItem.slug].showedPeriods }}

            .periodItem(
              v-if="filterPeriod !== 'all'"
              @click="addPeriodOrGroup"
            ): .mdi.mdi-plus

        //- Chart Content
        //-----------------------------
        .box._h272(
          v-if="filterPeriod !== 'all'"
          v-show="activeTabViewName !== 'history' && activeTabViewName !== 'chart'"
        )
          StatChartDonut2(
            v-if="filterPeriod !== 'all'"
            :isShowIncomes="activeTabViewName === 'incomes' || activeTabViewName === 'chart'"
            :isShowExpenses="activeTabViewName === 'expenses' || activeTabViewName === 'chart'"
            :key="activeTabViewName + period + filterPeriod + $store.state.chart.periods[filterPeriod].showedPeriods + this.$store.state.filter.categoryId + this.$store.state.filter.walletId"
          )
          ChartMenu2

        //- History
        //-----------------------------
        template(v-if="activeTabViewName === 'history'")
          .box
            TrnsList3

        //- Incomes / Expenses
        //-----------------------------
        template(v-if="activeTabViewName === 'chart'")
          .page__grid
            .box._h272(
              v-if="filterPeriod !== 'all'"
              v-show="activeTabViewName !== 'history'"
            )
              ChartMenu2
              StatChartDonut2(
                v-if="filterPeriod !== 'all'"
                :isShowIncomes="activeTabViewName === 'incomes' || activeTabViewName === 'chart'"
                :isShowExpenses="activeTabViewName === 'expenses' || activeTabViewName === 'chart'"
                :key="activeTabViewName + period + filterPeriod + $store.state.chart.periods[filterPeriod].showedPeriods + this.$store.state.filter.categoryId + this.$store.state.filter.walletId"
              )

            .boxFlew2
              .boxFlew2Item
                PeriodCatsChart2(type="incomes")
              .boxFlew2Item
                PeriodCatsChart2(type="expenses")

              .box._line(
                v-if="statCurrentPeriod.expenses.categoriesIds.length > 1 && !this.$store.state.filter.categoryId"
              )

            //- Period Selector
            //---------------------------
            .box__nav._noMargin
              .menuDots(@click="isShowPeriodsNames = true")
                .menuDots__name: Date(:type="2")
                .menuDots__dots: .mdi.mdi-dots-vertical

            //- Filter
            //---------------------------
            .page__filter(v-if="isShowFilter")
              FilterRow

            //- Incomes
            //---------------------------
            template(v-if="statAverage.incomes !== 0 || statCurrentPeriod.incomes.total !== 0")
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
                SummaryRowItemView(
                  :type="1"
                  :amount="statAverage.incomes"
                  :title="$t('money.averageIncomes')"
                )

              .boxEmpty(v-if="statCurrentPeriod.incomes.categoriesIds.length === 0") {{ $t('stat.empty') }}

              //- Cats incomes
              //---------------------------
              .box._stat(v-if="$store.state.ui.catsChart === 'visible' && statCurrentPeriod.incomes.categoriesIds.length > 0")
                .box__content
                  PeriodCatsChart(type="incomes")

              //- Stat incomes
              //---------------------------
              .box._stat(v-if="$store.state.ui.statItems === 'visible' && statCurrentPeriod.incomes.categoriesIds.length > 0")
                .box__content
                  StatItemMobile(
                    v-for="categoryId in statCurrentPeriod.incomes.categoriesIds"
                    :biggest="statCurrentPeriod.incomes.biggest"
                    :category="$store.state.categories.items[categoryId]"
                    :categoryId="categoryId"
                    :currency="$store.state.currencies.base"
                    :key="categoryId"
                    :total="statCurrentPeriod.categories[categoryId].incomes"
                    :type="1"
                  )

            //- Expenses
            //---------------------------
            template(v-if="statAverage.expenses !== 0 || statCurrentPeriod.expenses.total !== 0")
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
                SummaryRowItemView(
                  :type="0"
                  :amount="statAverage.expenses"
                  :title="$t('money.averageExpenses')"
                )

              .boxEmpty(v-if="statCurrentPeriod.expenses.categoriesIds.length === 0") {{ $t('stat.empty') }}

              //---------------------------
              .box._stat(v-if="$store.state.ui.catsChart === 'visible' && statCurrentPeriod.expenses.categoriesIds.length > 0")
                .box__content
                  PeriodCatsChart(type="expenses")

              //---------------------------
              .box._stat(v-if="$store.state.ui.statItems === 'visible' && statCurrentPeriod.expenses.categoriesIds.length > 0")
                .box__content
                  StatItemMobile(
                    v-for="categoryId in statCurrentPeriod.expenses.categoriesIds"
                    :biggest="statCurrentPeriod.expenses.biggest"
                    :category="$store.state.categories.items[categoryId]"
                    :categoryId="categoryId"
                    :currency="$store.state.currencies.base"
                    :key="categoryId"
                    :total="statCurrentPeriod.categories[categoryId].expenses"
                    :type="0"
                  )

            template(v-if="$store.getters['trns/selectedTrnsIdsWithDate'].length > 0")
              .boxTitle {{ $t('trns.history') }}
              .box(style="paddingTop: 0")
                TrnsList3(:size="10")

            //- Customize
            //---------------------------
            .box._periods
              .periods
                .periodItem(
                  @click="$store.dispatch('ui/toogleVisibleCatsChart')"
                  :class="{ _active: $store.state.ui.catsChart === 'visible' }"
                ) {{ $t('stat.customize.showCategorisChart') }}
                .periodItem(
                  :class="{ _active: $store.state.ui.statItems === 'visible' }"
                  @click="$store.dispatch('ui/toogleVisibilityStatItems')"
                ) {{ $t('stat.customize.showCategorisList') }}

        //- Stat
        //-----------------------------------------------------------------------
        template(v-if="activeTabViewName === 'incomes' || activeTabViewName === 'expenses'")
          .page__wrap
            //- Color Line Chart
            //---------------------------
            .box._line(
              v-if="statCurrentPeriod[activeTabStat].categoriesIds.length > 1 && !this.$store.state.filter.categoryId"
            )
              PeriodCatsChart2(:type="activeTabStat")

            //- Period Selector
            //---------------------------
            .box__nav
              .menuDots(@click="isShowPeriodsNames = true")
                .menuDots__name: Date(:type="2")
                .menuDots__dots: .mdi.mdi-dots-vertical

            //- Filter
            //---------------------------
            .page__filter(v-if="isShowFilter")
              FilterRow

            //-
            //---------------------------
            .boxSummary2._simple._pad
              .boxSummary2__item
                Amount(
                  :currency="$store.state.currencies.base"
                  :type="activeTabStat === 'incomes' ? 1 : 0"
                  :value="statCurrentPeriod[activeTabStat].total"
                  size="xl"
                  vertical="left"
                )
              SummaryRowItemView(
                :type="activeTabStat === 'incomes' ? 1 : 0"
                :amount="statAverage[activeTabStat]"
                :title="activeTabStat === 'incomes' ? $t('money.averageIncomes') : $t('money.averageExpenses')"
              )

            .boxEmpty(v-if="statCurrentPeriod[activeTabStat].categoriesIds.length === 0") {{ $t('stat.empty') }}

            .box(v-if="$store.state.ui.catsChart === 'visible' && statCurrentPeriod[activeTabStat].categoriesIds.length > 0")
              .box__content
                PeriodCatsChart(:type="activeTabStat")

            .box(v-if="$store.state.ui.statItems === 'visible' && statCurrentPeriod[activeTabStat].categoriesIds.length > 0")
              .box__content
                StatItemMobile(
                  v-for="categoryId in statCurrentPeriod[activeTabStat].categoriesIds"
                  :biggest="statCurrentPeriod[activeTabStat].biggest"
                  :category="$store.state.categories.items[categoryId]"
                  :categoryId="categoryId"
                  :currency="$store.state.currencies.base"
                  :key="categoryId"
                  :total="statCurrentPeriod.categories[categoryId][activeTabStat]"
                  :type="activeTabStat === 'incomes' ? 1 : 0"
                )

            template(v-if="$store.getters['trns/selectedTrnsIdsWithDate'].length > 0")
              .boxTitle {{ $t('trns.history') }}
              .box(style="paddingTop: 0")
                TrnsList3(
                  :incomes="activeTabStat === 'incomes'"
                  :expenses="activeTabStat === 'expenses'"
                  :size="10"
                )

            .box._periods
              .periods
                .periodItem(
                  @click="$store.dispatch('ui/toogleVisibleCatsChart')"
                  :class="{ _active: $store.state.ui.catsChart === 'visible' }"
                ) {{ $t('stat.customize.showCategorisChart') }}
                .periodItem(
                  :class="{ _active: $store.state.ui.statItems === 'visible' }"
                  @click="$store.dispatch('ui/toogleVisibilityStatItems')"
                ) {{ $t('stat.customize.showCategorisList') }}

  .layoutMobile__menu.pageScrollerJsMenu
    LayoutMobileMenu

  //- Modals
  //---------------------------------------------------------------------------
  CategoryModal(:slider="slider")
  CurrencyModal
  TrnForm(v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']")
  TrnModal
  WalletModal(:slider="slider")

  LazyDateSelectorModal(
    v-if="isShowPeriodsNames"
    @onClose="isShowPeriodsNames = false"
  )

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

<style lang="stylus">
@import '~assets/stylus/variables'

.finapp .box .cats-chart__items
  margin 0 (- $m7)
  padding-top $m5
  padding-right $m7
  padding-bottom 0
  padding-left $m7

  &:before
    left (- $m7)
    background linear-gradient(to right, var(--c-bg-4), rgba(0,0,0,0))

  &:after
    right (- $m7)
    background linear-gradient(to right, rgba(0,0,0,0), var(--c-bg-4))

  &:before
  &:after
    z-index 10
    content ''
    position absolute
    top 0
    width $m7
    height 100%

.finapp .page__header
  .filterRow
    padding $m6

  .filterItem
    padding $m6 $m5

.finapp .page__content .trnsList
  .trnItem._history
    margin-right (- $m6)
    margin-left (- $m6)
    padding-right $m7
    padding-left $m7

.finapp .page__content .dropdown._noBd
  margin 0 $m2 !important
  border-radius $m6
</style>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.menuDots
  cursor pointer
  display flex
  align-items center
  justify-content center

  &__dots
    padding-top 3px
    padding-left 4px
    color var(--c-font-2)
    font-size 16px

.boxFlew2
  display grid
  grid-template-columns 1fr 1fr
  grid-column-gap $m7
  padding 0 $m7

.boxFlew2Item
  overflow hidden
  background var(--c-bg-5)
  border-radius $m6

.layoutMobile
  display grid
  height 100%
  padding-bottom 44px
  background var(--c-bg-4)

  &__content
    overflow hidden

  &__menu
    position fixed
    left 0
    bottom 0
    width 100%
    transition all .3s ease

    &._hide
      transform translateY(100%)

.boxEmpty
  padding 0 $m7
  padding-top $m6
  padding-bottom $m10
  color var(--c-font-5)
  font-size 10px

.boxSummary2
  z-index 9
  position sticky
  top 60px
  display flex
  align-items center
  justify-content flex-start
  margin-bottom $m3
  padding 0 $m7
  padding-bottom $m5
  background var(--c-bg-4)

  &._simple
    top 42px
    padding-top $m6

  &._pad
    top 38px

  &._pad22
    padding-top $m7

  &__item
    padding-right $m9

.boxSummary
  padding-top 8px
  padding-bottom $m6

.boxSwitcher
  max-width 640px
  margin 0 auto

  .switcher2
    .switcher2__item
      +media-tablet()
        padding $m7 $m6
        font-size 14px
        font-weight 400

$border = 1px

.periods
  z-index 2
  position relative
  display flex
  align-items center
  margin-bottom (- $m7)
  padding-top $m5

.periodItem
  cursor pointer
  flex-grow 1
  display flex
  align-items center
  justify-content center
  min-width 50px
  padding 12px $m6
  color var(--c-font-5)
  font-size 12px

  &:active
    background var(--c-bg-5)

  &._active
    color var(--c-font-3)

  &__count
    padding-left $m4

.date
  color var(--c-font-3)
  font-size 18px
  font-weight 600

.switcher
  overflow hidden
  position relative
  display flex
  align-items stretch
  justify-content stretch
  margin 0 $m6

  &__item
    opacity .6
    flex 1 1 1%
    display flex
    align-items center
    justify-content center
    padding $m6 $m5
    color var(--c-font-4)
    font-size 14px
    border-radius $m7

    +media-hover()
      background var(--c-bg-3)

    &:active
      opacity 1
      background var(--c-bg-3)

    &._active
      opacity 1
      color var(--c-font-2)
      background var(--c-bg-5)

.week
  display flex
  align-items center
  margin 0 (- $m6)
  padding $m6 0
  border 1px solid transparent
  border-bottom-color var(--c-bg-5)

  &:last-child
    border-bottom-color transparent

  &:active:not(._header._bottom)
    background var(--c-bg-5)
    border-radius $m5

  &._active
    background var(--c-bg-3)
    border 1px solid var(--c-bg-6)
    border-radius $m5

  &._header
    opacity .6
    border-bottom-color var(--c-bg-7)
    border-bottom-width 2px
    margin-bottom $m4

  &._bottom
    opacity .6
    border-top-color var(--c-bg-7)
    border-top-width 2px
    margin-top (- $m3)

  > div
    flex 1 0 1%
    padding 0 $m6

  &__name
    color var(--c-font-2)
    font-size 12px
    text-transform capitalize

    ~/._header &
      font-weight 500

  &:last-child
    // padding-bottom 0

.box2
  position relative
  margin $m7
  margin-top $m9
  margin-bottom $m7

.boxNavItem
  cursor pointer
  padding 0 $m5
  color var(--c-font-4)
  font-size 32px
  font-weight 400
  transform translateY(-22px)
  transition all .3s ease

  &:active
    background var(--c-bg-5)

  &._disable
    opacity .2

  &._last
    //

.activrPeriodName
  font-size 14px

.boxTitle
  z-index 9
  position sticky
  top 37px
  display flex
  align-items center
  padding $m6 $m7
  color var(--c-font-4)
  font-size 10px
  font-weight 600
  text-transform uppercase
  background var(--c-bg-4)

// Box
// ----------------------------------------------------------------------------
.box
  position relative
  padding $m7 $m7
  padding-bottom $m9
  background var(--c-bg-4)

  +media-tablet()
    border-bottom 0

  &._stat
    padding-top $m6

  &._h272
    height 232px
    padding-bottom 0
    border-bottom 0

  &._line
    padding-top 0
    padding-bottom $m6
    border-bottom 0

  &._nobd
    padding 0

  &._simple
    padding-top $m7
    padding-bottom $m7
    border-bottom 0

  &._periods
    padding 0
    padding-bottom $m6

  &__title
  &__title2
    display flex
    // display none
    align-items center
    padding-top $m5
    padding-bottom $m8
    color var(--c-font-4)
    font-size 10px
    font-weight 600
    text-transform uppercase

  &__title2
    margin-left (- $m8)
    padding-bottom 0
    font-size 14px

  &__title
    z-index 9
    position sticky
    top 37px
    padding-top $m6
    padding-bottom $m6
    background var(--c-bg-4)

  &__nav
    z-index 10
    position sticky
    top 0
    display flex
    justify-content center
    height 38px
    margin-bottom $m3
    background var(--c-bg-4)

    &._noMargin
      margin-bottom 0

  &__control
    flex-grow 1
    display flex
    align-items center
    justify-content flex-end
    margin-top (- $m6)
    color var(--c-font-3)
    font-size 29px

.page
  overflow hidden
  display grid
  height 100%
  max-width 900px
  margin 0 auto
  background var(--c-bg-4)
  box-shadow 0 10px 30px 10px var(--c-bg-1)

  &__line
    width 90%
    height 1px
    margin 0 auto

  &__content
    overflow hidden
    overflow-y auto
    scrollbar()
    height 100%

  &__grid
    +media-tablet()
      display grid
      grid-template-columns repeat(auto-fill, minmax(300px, 1fr))
      grid-column-gap 40px
      grid-row-gap 40px
      padding 40px

  &__block
    z-index 10
    opacity .99
    position sticky
    top 0
    width 100%
    padding 0 0
    background var(--c-bg-3)
    box-shadow 0 0 12px 5px rgba(0, 0, 0, .4)
    transition all .3s ease

    /.light-mode &
      box-shadow 0 0 12px 5px rgba(120, 120, 120, .5)

    &._hide
      transform translateY(-100%)

  &__header
    overflow hidden
    z-index 2
    position fixed
    bottom 44px
    width 100%
    background var(--c-bg-3)
    transition all .3s ease
    border-top 1px solid var(--c-bg-6)

    &._hide
      transform translateY(calc(100% + 56px))

  &__period
    padding $m6
    padding-bottom 0

  &__summary
    flex-grow 1
    display flex
    align-items center
    justify-content space-between
    padding-bottom $m5
    background var(--c-bg-3)

    +media-tablet()
      max-width 500px
      margin 0 auto
      padding $m8 0

  &__nav
    border-top 1px solid var(--c-bg-6)
    border-bottom 1px solid var(--c-bg-6)

  &._active
    color var(--c-font-2)
    border-bottom 2px solid var(--c-bg-9)

.switcher2
  display flex
  align-items center

  &._bg
    overflow hidden
    overflow-x auto
    margin-bottom (- $border)
    background var(--c-bg-3)

.switcher2__item
  cursor pointer
  flex-grow 1
  padding 12px $m7
  color var(--c-font-5)
  font-size 12px
  font-weight 500
  font-roboto()
  text-align center
  border-bottom $border solid var(--c-bg-5)

  &:active
    background var(--c-bg-5)
    border-radius $m6 $m6 0 0
    border-bottom $border solid var(--c-bg-5)

  &._active
    cursor default
    color var(--c-font-3)
    background none
    border-bottom $border solid var(--c-blue-1)
</style>
