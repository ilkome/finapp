<script>
import Amount from '@/components/amount/Amount'
import EmptyData from '@/components/shared/emptyData/EmptyData'
import FilterItem from '@/components/filter/FilterItem'
import Icon from '@/components/icon/Icon'
import PeriodCatsChart from '@/components/stat/cats/PeriodCatsChart'
import StatCustomizeMenuMobile from '@/components/stat/StatCustomizeMenuMobile'
import StatItem from '@/components/stat/StatItem'
import StatSummaryMobile from '@/components/stat/StatSummaryMobile'
import TrnsList from '@/components/trns/list/TrnsList'

export default {
  components: {
    Amount,
    EmptyData,
    FilterItem,
    Icon,
    PeriodCatsChart,
    StatCustomizeMenuMobile,
    StatItem,
    StatSummaryMobile,
    TrnsList
  },

  computed: {
    activeTabStat () {
      return this.$store.state.ui.stat.activeTab
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
    stat () {
      return this.$store.getters.stat
    }
  },

  methods: {
    clearCategoryFilter () {
      const nextCategory = this.filterCategory.parentId !== 0 ? this.filterCategory.parentId : null
      this.$store.dispatch('setFilterCategoryId', nextCategory)
    },
    clearParentCategoryFilter () {
      this.$store.dispatch('setFilterCategoryId', null)
    },
    clearWalletFilter () {
      this.$store.dispatch('setFilterWalletId', null)
    }
  }
}
</script>

<template lang="pug">
.stat
  StatSummaryMobile(v-if="$store.state.ui.statSummuryVisibility === 'visible'")

  .stat__filter(v-if="$store.state.filter.categoryId || $store.state.filter.walletId")
    template(v-if="$store.state.filter.walletId")
      FilterItem(
        :color="filterWallet.color || $store.state.ui.defaultBgColor"
        :name="filterWallet.name"
        icon="mdi mdi-credit-card-multiple"
        v-on:onClick="clearWalletFilter")
    template(v-if="$store.state.filter.categoryId")
      template(v-if="filterCategory.parentId !== 0")
        FilterItem(
          :color="filterCategoryParent.color || $store.state.ui.defaultBgColor"
          :icon="filterCategoryParent.icon"
          :name="filterCategoryParent.name"
          v-on:onClick="clearParentCategoryFilter")
      FilterItem(
        :color="filterCategory.color || $store.state.ui.defaultBgColor"
        :icon="filterCategory.icon"
        :name="filterCategory.name"
        v-on:onClick="clearCategoryFilter")

  //- empty
  //------------------------------------------------
  EmptyData(
    v-if="stat.incomes.categoriesIds.length === 0 && stat.expenses.categoriesIds.length === 0 && $store.getters.selectedTrnsIdsWithDate.length === 0"
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
      .statGroup(v-if="stat.incomes.categoriesIds.length")
        .statItem-header
          .statItem-total
            .statItem-total__title._incomes {{ $lang.money.incomes }}
            .statItem-total__amount
              Amount(
                :currency="$store.state.currencies.base"
                :type="1"
                :value="stat.incomes.total.incomes")
          .statItem-average(v-if="$store.state.stat.showedPeriods > 1")
            .statItem-average__title
              .statItem-average__title-icon: .mdi.mdi-chart-timeline
              .statItem-average__title-text {{ $lang.money.average }}
            .statItem-average__amount
              Amount(
                :currency="$store.state.currencies.base"
                :small="true"
                :value="$store.getters.statAverage.incomes")
        //- incomes: cats charts
        .stat__charts(v-if="$store.state.ui.catsChart === 'visible'")
          PeriodCatsChart(type="incomes")

        //- incomes: cats stat item
        .stat__cats(v-if="$store.state.ui.statItems === 'visible'")
          StatItem(
            v-for="categoryId in stat.incomes.categoriesIds"
            :biggest="stat.incomes.biggest"
            :category="$store.state.categories.items[categoryId]"
            :categoryId="categoryId"
            :currency="$store.state.currencies.base"
            :key="categoryId"
            :type="1"
            :total="stat.categories[categoryId].incomes")

      //- expenses
      .statGroup(v-if="stat.expenses.categoriesIds.length")
        .statItem-header
          .statItem-total
            .statItem-total__title._expenses {{ $lang.money.expenses }}
            .statItem-total__amount
              Amount(
                :currency="$store.state.currencies.base"
                :type="0"
                :value="stat.expenses.total.expenses")
          .statItem-average(v-if="$store.state.stat.showedPeriods > 1")
            .statItem-average__title
              .statItem-average__title-icon: .mdi.mdi-chart-timeline
              .statItem-average__title-text {{ $lang.money.average }}
            .statItem-average__amount
              Amount(
                :currency="$store.state.currencies.base"
                :small="true"
                :value="$store.getters.statAverage.expenses"
              )
        //- expenses: cats charts
        .stat__charts(v-if="$store.state.ui.catsChart === 'visible'")
          PeriodCatsChart(type="expenses")

        //- expenses: cats stat item
        .stat__cats(v-if="$store.state.ui.statItems === 'visible'")
          StatItem(
            v-for="categoryId in stat.expenses.categoriesIds"
            :biggest="stat.expenses.biggest"
            :category="$store.state.categories.items[categoryId]"
            :categoryId="categoryId"
            :currency="$store.state.currencies.base"
            :key="categoryId"
            :type="0"
            :total="stat.categories[categoryId].expenses")

  .customize
    StatCustomizeMenuMobile
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/flex"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/scrollbar"

.customize
  padding 0 $m7
  padding-bottom $m9
  margin-top $m9

.stat
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
</style>
