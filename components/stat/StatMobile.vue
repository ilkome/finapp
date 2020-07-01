<script>
export default {
  computed: {
    activeTabStat () {
      return this.$store.state.ui.stat.activeTab
    },

    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
    },

    isEmptyData () {
      return this.statCurrentPeriod.incomes.categoriesIds.length === 0 &&
              this.statCurrentPeriod.expenses.categoriesIds.length === 0 &&
              this.$store.getters['trns/selectedTrnsIdsWithDate'].length === 0
    },

    filterCategory () {
      return this.$store.state.categories.items[this.$store.state.filter.categoryId]
    },

    filterCategoryParent () {
      return this.$store.state.categories.items[this.filterCategory.parentId]
    },

    filterWallet () {
      return this.$store.state.wallets.items[this.$store.state.filter.walletId]
    }
  },

  methods: {
    clearCategoryFilter () {
      const nextCategory = this.filterCategory.parentId !== 0 ? this.filterCategory.parentId : null
      this.$store.dispatch('filter/setFilterCategoryId', nextCategory)
    },

    clearParentCategoryFilter () {
      this.$store.dispatch('filter/setFilterCategoryId', null)
    },

    clearWalletFilter () {
      this.$store.dispatch('filter/setFilterWalletId', null)
    }
  }
}
</script>

<template lang="pug">
.stat
  .stat__filter(v-if="$store.state.filter.categoryId || $store.state.filter.walletId")
    template(v-if="$store.state.filter.walletId")
      FilterItem(
        :color="filterWallet.color || $store.state.ui.defaultBgColor"
        :name="filterWallet.name"
        icon="mdi mdi-credit-card-multiple"
        @onClick="clearWalletFilter")

    template(v-if="$store.state.filter.categoryId")
      template(v-if="filterCategory.parentId !== 0")
        FilterItem(
          :color="filterCategoryParent.color || $store.state.ui.defaultBgColor"
          :icon="filterCategoryParent.icon"
          :name="filterCategoryParent.name"
          @onClick="clearParentCategoryFilter")
      FilterItem(
        :color="filterCategory.color || $store.state.ui.defaultBgColor"
        :icon="filterCategory.icon"
        :name="filterCategory.name"
        @onClick="clearCategoryFilter")

  .block
    StatSummaryMobile(v-show="$store.state.ui.statSummuryVisibility === 'visible'")

    template(v-if="!$store.getters['trns/hasTrns']")
      .startSomething
        .options__item(v-if="$store.getters['wallets/hasWallets'] && $store.getters['categories/hasCategories']")
          Button._grey._center(
            :title="$lang.createTrn"
            @onClick="$store.dispatch('trnForm/openTrnForm', { action: 'create' })"
          )

        .options__item(v-if="$store.state.demo.hasDemo")
          Button._blue._center(
          size="xl"
          :title="$lang.welcome.demo.btn"
          @onClick="$router.push('/welcome')"
        )

    //- empty
    //------------------------------------------------
    EmptyData(
      v-if="isEmptyData && $store.getters['trns/hasTrns']"
      :text="$lang.stat.empty")

    //- history
    //------------------------------------------------
    div(v-if="activeTabStat === 'history'")
      TrnsList

    //- stat
    //------------------------------------------------
    div(v-show="activeTabStat === 'stat'")
      .stat__content
        //- incomes
        .statGroup(v-if="statCurrentPeriod.incomes.categoriesIds.length")
          .statItem-header
            .statItem-total
              .statItem-total__title._incomes {{ $lang.money.incomes }}
              .statItem-total__amount
                Amount(
                  :currency="$store.state.currencies.base"
                  :type="1"
                  :value="statCurrentPeriod.incomes.total")
            .statItem-average(v-if="$store.state.stat.showedPeriods > 1")
              .statItem-average__title
                .statItem-average__title-icon: .mdi.mdi-chart-timeline
                .statItem-average__title-text {{ $lang.money.average }}
              .statItem-average__amount
                Amount(
                  :currency="$store.state.currencies.base"
                  :small="true"
                  :value="$store.getters['stat/statAverage'].incomes")
          //- incomes: cats charts
          .stat__charts(v-show="$store.state.ui.catsChart === 'visible'")
            PeriodCatsChart(type="incomes")

          //- incomes: cats stat item
          .stat__cats(v-show="$store.state.ui.statItems === 'visible'")
            StatItem(
              v-for="categoryId in statCurrentPeriod.incomes.categoriesIds"
              :biggest="statCurrentPeriod.incomes.biggest"
              :category="$store.state.categories.items[categoryId]"
              :categoryId="categoryId"
              :currency="$store.state.currencies.base"
              :key="categoryId"
              :type="1"
              :total="statCurrentPeriod.categories[categoryId].incomes")

        //- expenses
        .statGroup(v-if="statCurrentPeriod.expenses.categoriesIds.length")
          .statItem-header
            .statItem-total
              .statItem-total__title._expenses {{ $lang.money.expenses }}
              .statItem-total__amount
                Amount(
                  :currency="$store.state.currencies.base"
                  :type="0"
                  :value="statCurrentPeriod.expenses.total")
            .statItem-average(v-if="$store.state.stat.showedPeriods > 1")
              .statItem-average__title
                .statItem-average__title-icon: .mdi.mdi-chart-timeline
                .statItem-average__title-text {{ $lang.money.average }}
              .statItem-average__amount
                Amount(
                  :currency="$store.state.currencies.base"
                  :small="true"
                  :value="$store.getters['stat/statAverage'].expenses"
                )
          //- expenses: cats charts
          .stat__charts(v-show="$store.state.ui.catsChart === 'visible'")
            PeriodCatsChart(type="expenses")

          //- expenses: cats stat item
          .stat__cats(v-show="$store.state.ui.statItems === 'visible'")
            StatItem(
              v-for="categoryId in statCurrentPeriod.expenses.categoriesIds"
              :biggest="statCurrentPeriod.expenses.biggest"
              :category="$store.state.categories.items[categoryId]"
              :categoryId="categoryId"
              :currency="$store.state.currencies.base"
              :key="categoryId"
              :type="0"
              :total="statCurrentPeriod.categories[categoryId].expenses")

        .stat__trns(v-if="$store.state.ui.statLastTrnsVisibility === 'visible' && $store.getters['trns/selectedTrnsIdsWithDate'].length > 0")
          .stat__name Last transactions
          TrnsList(:limit="6", ui="lastTrns")

  .customize
    StatCustomizeMenuMobile
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/flex"
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/scroll"

.swiper-slide
  height 100%
  overflow hidden
  overflow-y auto

.customize
  display none

  @media $media-phone-sm
    display block
    padding 0 $m7
    padding-bottom $m9
    margin-top $m9

.stat
  position relative

  &__filter
    display flex
    overflow hidden
    overflow auto
    padding 16px 16px
    padding-right 0
    background var(--c-bg-4)
    scrollbar()
    &:after
      display block
      content ""
      width 1px
      flex 0 0 16px

  &__charts
    padding-bottom $m7
    &:last-child
      padding-bottom 0

  &__name
    padding 0 10px
    padding-bottom 10px
    font-header-1()

  &__trns
    padding 0 10px
    padding-bottom 20px

.statGroup
  padding-top $m9
  padding-bottom 10px

  & + &
    border-top 1px solid var(--c-bg-6)

.statItem-header
  padding-bottom $m8

  &:last-child
    padding-bottom 0

.statItem-total
  padding 0 $m7
  display flex
  align-items center
  flex-grow 1

  &__title
    flex-grow 1
    font-header-4()

    &._incomes
      color var(--c-incomes-1)

    &._expenses
      color var(--c-expenses-1)

.statItem-average
  display flex
  align-items center
  padding 0 $m7
  padding-top $m5

  &__title
    flex-grow 1
    display flex
    align-items center
    color var(--c-font-4)

    &-icon
      opacity .8
      margin-right $m6

  &__amount
    opacity .6

.statItem
  &__trns
    padding-bottom $m8

.startSomething
  padding 100px 20px
  display flex
  flex-flow column
  align-items center
  justify-content center

  .options__item
    margin-bottom 40px
</style>
