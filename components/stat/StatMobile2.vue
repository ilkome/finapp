<script>
export default {
  data () {
    return {
      view: 'expenses'
    }
  },

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
    },

    isShowIncomes () {
      return this.view === 'incomes' && this.statCurrentPeriod.incomes.categoriesIds.length
    },

    isShowExpenses () {
      return this.view === 'expenses' && this.statCurrentPeriod.expenses.categoriesIds.length
    },

    isShowHistory () {
      return this.view === 'trns'
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
  .stat__filter.swiper-no-swiping(v-if="$store.state.filter.categoryId || $store.state.filter.walletId")
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

  //- stat
  //------------------------------------------------
  .stat__view(:class="{ _withFilter: ($store.state.filter.categoryId || $store.state.filter.walletId) }")
    .statItem-header(
      :class="{ _active: view === 'incomes' }"
      @click="view = 'incomes'"
    )
      .statItem-total
        .statItem-total__title {{ $t('money.incomes') }}
        .statItem-total__amount
          Amount(
            size="md"
            :currency="$store.state.currencies.base"
            :type="1"
            :value="statCurrentPeriod.incomes.total")

    .statItem-header(
      :class="{ _active: view === 'expenses' }"
      @click="view = 'expenses'"
    )
      .statItem-total
        .statItem-total__title {{ $t('money.expenses') }}
        .statItem-total__amount
          Amount(
            size="md"
            :currency="$store.state.currencies.base"
            :type="0"
            :value="statCurrentPeriod.expenses.total")

    .statItem-header(
      :class="{ _active: view === 'trns' }"
      @click="view = 'trns'"
    )
      .statItem-total
        .statItem-total__title {{ $t('trns.shortTitle') }}
        .statItem-total__amount
          Amount(
            size="md"
            :currency="$store.state.currencies.base"
            :type="3"
            :value="statCurrentPeriod.incomes.total - statCurrentPeriod.expenses.total"
          )

  //-
  .stat__content
    //- incomes
    .statGroup(v-show="isShowIncomes")
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
    .statGroup(v-show="isShowExpenses")
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

    //- expenses
    .statGroup(v-show="isShowHistory")
      TrnsList

  //- empty
  //------------------------------------------------
  EmptyData(
    v-if="isEmptyData && $store.getters['trns/hasTrns']"
    :text="$t('stat.empty')"
  )
</template>

<style lang="stylus">
.stat
  .cats-chart__items
    padding-right 8px
    padding-left 8px

  .trnsList
    .trnsList__grid
      padding 0

      .trnsList__day
        margin-top 0

        &:last-child
          margin-bottom 0
          padding-bottom 0
          border-bottom 0
</style>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/flex"
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/scroll"

.swiper-slide
  overflow hidden
  overflow-y auto
  height 100%

.stat
  position relative
  margin 0 -8px

  &__filter
    overflow auto
    z-index 10
    opacity .95
    position sticky
    top 34px
    display flex
    padding-top 16px
    background var(--c-bg-2)
    scrollbar()

  &__view
    z-index 10
    opacity .95
    position sticky
    top 50px
    display flex
    align-items center
    justify-content space-between
    margin-top $m5
    background var(--c-bg-2)

    &._withFilter
      top 86px

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
  padding-top $m7

.statItem-header
  flex-grow 1
  padding $m3
  padding-top $m6
  padding-bottom $m6
  border-bottom 2px solid transparent

  &._active
    opacity 1
    border-bottom 2px solid var(--c-bg-9)

.statItem-total
  display flex
  align-items center
  flex-flow column
  flex-grow 1
  padding 0 $m2

  &__amount
    padding-top $m5

  &__title
    flex-grow 1
    font-size 12px
    color var(--c-font-3)

    &._incomes
      color var(--c-incomes-1)

    &._expenses
      color var(--c-expenses-1)

.statItem
  &__trns
    padding-bottom $m8
</style>
