<script>
import Swiper from 'swiper'
import 'swiper/dist/css/swiper.min.css'

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

  data () {
    return {
      slider: null
    }
  },

  computed: {
    activeTabStat () {
      return this.$store.state.ui.stat.activeTab
    },
    isEmptyData () {
      return this.statCurrentPeriod.incomes.categoriesIds.length === 0 &&
              this.statCurrentPeriod.expenses.categoriesIds.length === 0 &&
              this.$store.getters.selectedTrnsIdsWithDate.length === 0
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
    statCurrentPeriod () {
      return this.$store.getters.statCurrentPeriod
    }
  },

  mounted () {
    this.slider = new Swiper(this.$refs.slider, {})
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

  .slider
    .swiper-container(ref="slider")
      .swiper-wrapper
        .swiper-slide
          StatSummaryMobile(v-show="$store.state.ui.statSummuryVisibility === 'visible'")

          //- empty
          //------------------------------------------------
          EmptyData(
            v-if="isEmptyData"
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
                        :value="$store.getters.statAverage.incomes")
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
                        :value="$store.getters.statAverage.expenses"
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

              .stat__trns(v-if="$store.state.ui.statLastTrnsVisibility === 'visible' && $store.getters.selectedTrnsIdsWithDate.length > 0")
                .stat__name Last transactions
                TrnsList(:limit="6", ui="lastTrns")

  .customize
    StatCustomizeMenuMobile
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/flex"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/scrollbar"

.flickity-viewport
  transition: height 0.2s
.slider
  height 100%

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
</style>
