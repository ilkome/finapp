<script>
export default {
  name: 'StatMobile',

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
  //- Filter
  //---------------------------------------------------------------------------
  .stat__filter.swiper-no-swiping(v-if="$store.state.filter.categoryId || $store.state.filter.walletId")
    //- Wallet
    template(v-if="$store.state.filter.walletId")
      FilterItem(
        :color="filterWallet.color || $store.state.ui.defaultBgColor"
        :name="filterWallet.name"
        icon="mdi mdi-credit-card-multiple"
        @onClick="clearWalletFilter"
      )

    //- Category
    template(v-if="$store.state.filter.categoryId")
      //- Parent
      template(v-if="filterCategory.parentId !== 0")
        FilterItem(
          :color="filterCategoryParent.color || $store.state.ui.defaultBgColor"
          :icon="filterCategoryParent.icon"
          :name="filterCategoryParent.name"
          @onClick="clearParentCategoryFilter"
        )
      //- Child
      FilterItem(
        :color="filterCategory.color || $store.state.ui.defaultBgColor"
        :icon="filterCategory.icon"
        :name="filterCategory.name"
        @onClick="clearCategoryFilter"
      )

  //- Header
  //---------------------------------------------------------------------------
  .stat__header(:class="{ _withFilter: ($store.state.filter.categoryId || $store.state.filter.walletId) }")
    .statItem-header(
      :class="{ _active: activeTabStat === 'incomes' }"
      @click="$store.dispatch('ui/setActiveTabStat', 'incomes')"
    )
      .statItem-total
        .statItem-total__title {{ $t('money.incomes') }}
        .statItem-total__amount
          Amount(
            :currency="$store.state.currencies.base"
            :type="1"
            :value="statCurrentPeriod.incomes.total"
            size="md"
          )

    .statItem-header(
      :class="{ _active: activeTabStat === 'expenses' }"
      @click="$store.dispatch('ui/setActiveTabStat', 'expenses')"
    )
      .statItem-total
        .statItem-total__title {{ $t('money.expenses') }}
        .statItem-total__amount
          Amount(
            :currency="$store.state.currencies.base"
            :type="0"
            :value="statCurrentPeriod.expenses.total"
            size="md"
          )

    .statItem-header(
      :class="{ _active: activeTabStat === 'history' }"
      @click="$store.dispatch('ui/setActiveTabStat', 'history')"
    )
      .statItem-total
        .statItem-total__title {{ $t('trns.shortTitle') }}
        .statItem-total__amount
          Amount(
            :currency="$store.state.currencies.base"
            :type="3"
            :value="statCurrentPeriod.incomes.total - statCurrentPeriod.expenses.total"
            size="md"
          )

  //- Content
  //---------------------------------------------------------------------------
  .stat__content
    //- Incomes
    //-------------------------------------------------------------------------
    .statGroup(v-show="activeTabStat === 'incomes'")
      EmptyData(
        v-if="$store.getters['trns/hasTrns'] && statCurrentPeriod.incomes.categoriesIds.length === 0"
        :text="$t('stat.empty')"
      )

      //- Categories charts
      .stat__charts(v-show="$store.state.ui.catsChart === 'visible'")
        PeriodCatsChart(type="incomes")

      //- Categories list
      .stat__cats(v-show="$store.state.ui.statItems === 'visible'")
        StatItem(
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
    //-------------------------------------------------------------------------
    .statGroup(v-show="activeTabStat === 'expenses'")
      EmptyData(
        v-if="$store.getters['trns/hasTrns'] && statCurrentPeriod.expenses.categoriesIds.length === 0"
        :text="$t('stat.empty')"
      )

      //- Categories charts
      .stat__charts(v-show="$store.state.ui.catsChart === 'visible'")
        PeriodCatsChart(type="expenses")

      //- Categories list
      .stat__cats(v-show="$store.state.ui.statItems === 'visible'")
        StatItem(
          v-for="categoryId in statCurrentPeriod.expenses.categoriesIds"
          :biggest="statCurrentPeriod.expenses.biggest"
          :category="$store.state.categories.items[categoryId]"
          :categoryId="categoryId"
          :currency="$store.state.currencies.base"
          :key="categoryId"
          :total="statCurrentPeriod.categories[categoryId].expenses"
          :type="0"
        )

    //- History
    //-------------------------------------------------------------------------
    .statGroup(v-show="activeTabStat === 'history'")
      EmptyData(
        v-if="$store.getters['trns/hasTrns'] && $store.getters['trns/selectedTrnsIdsWithDate'].length === 0"
        :text="$t('stat.empty')"
      )

      TrnsList
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

  &__header
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
