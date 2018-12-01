<script>
import Amount from '@/components/amount/Amount'
import ContextMenu from '@/components/shared/contextMenu/ContextMenu'
import ContextMenuItem from '@/components/shared/contextMenu/ContextMenuItem'
import Dropdown from '@/components/shared/dropdown/Dropdown'
import EmptyData from '@/components/shared/emptyData/EmptyData'
import FilterItem from '@/components/filter/FilterItem'
import Icon from '@/components/icon/Icon'
import PeriodCatsChart from '@/components/stat/cats/PeriodCatsChart'
import Slider from '@/components/slider/Slider'
import StatItem from '@/components/stat/StatItem'
import StatSummaryMobile from '@/components/stat/StatSummaryMobile'
import TrnsList from '@/components/trns/list/TrnsList'
import TrnsListViewEasy from '@/components/trns/list/TrnsListViewEasy'

export default {
  components: {
    Amount,
    ContextMenu,
    ContextMenuItem,
    Dropdown,
    EmptyData,
    FilterItem,
    Icon,
    PeriodCatsChart,
    Slider,
    StatItem,
    StatSummaryMobile,
    TrnsList,
    TrnsListViewEasy
  },

  data () {
    return {
      visibleCustomizeMenu: false
    }
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
    onSlideChange (slideIndex) {
      this.$store.commit('setStatSliderIndex', slideIndex)
    },

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
  StatSummaryMobile

  //- empty
  //------------------------------------------------
  EmptyData(
    v-if="stat.incomes.categoriesIds.length === 0 && stat.expenses.categoriesIds.length === 0"
    text="No stat for this period")

  //- history
  //------------------------------------------------
  div(v-if="activeTabStat === 'history'")
    TrnsList

  //- stat
  //------------------------------------------------
  div(v-show="activeTabStat === 'stat'")
    .stat__lastTrns(v-if="$store.state.ui.lastTrns === 'visible'")
      TrnsListViewEasy

    .stat__filter(v-if="$store.state.filter.categoryId || $store.state.filter.walletId")
      .filter
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

    .stat__content
      //- incomes
      .statGroup(v-if="stat.incomes.categoriesIds.length")
        .statItem-header(@click="$store.dispatch('tooglevisibleLastTrns')")
          .statItem-total
            .statItem-total__title._incomes Incomes
            .statItem-total__amount
              Amount(
                :currency="$store.state.currencies.base"
                :type="1"
                :value="stat.incomes.total.incomes")
          .statItem-average(v-if="$store.state.stat.showedPeriods > 1")
            .statItem-average__title
              .statItem-average__title-icon: .mdi.mdi-chart-timeline
              .statItem-average__title-text Average
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
        .statItem-header(@click="$store.dispatch('tooglevisibleLastTrns')")
          .statItem-total
            .statItem-total__title._expenses Expenses
            .statItem-total__amount
              Amount(
                :currency="$store.state.currencies.base"
                :type="0"
                :value="stat.expenses.total.expenses")
          .statItem-average(v-if="$store.state.stat.showedPeriods > 1")
            .statItem-average__title
              .statItem-average__title-icon: .mdi.mdi-chart-timeline
              .statItem-average__title-text Average
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
    ContextMenu(
      :position="{ left: true, bottom: true }"
      :visible="visibleCustomizeMenu"
      v-on:onClickOpener="visibleCustomizeMenu = !visibleCustomizeMenu")
      template(slot="opener")
        Dropdown._inline(
          :active="visibleCustomizeMenu"
          title="Customize")
      template(slot="content")
        ContextMenuItem(
          icon="mdi mdi-credit-card-multiple"
          title="Wallets"
          :checkValue="$store.state.ui.stat.walletsVisibility === 'visible'"
          v-on:onClick="$store.dispatch('setStatWalletsVisibility')"
          v-on:onClose="visibleCustomizeMenu = !visibleCustomizeMenu")
        ContextMenuItem(
          icon="mdi mdi-chart-bar-stacked"
          title="Periods chart"
          :checkValue="$store.state.ui.statGraphsVisible"
          v-on:onClick="$store.dispatch('toogleShowStatGraphs')"
          v-on:onClose="visibleCustomizeMenu = !visibleCustomizeMenu")
        ContextMenuItem(
          icon="mdi mdi-history"
          title="Last trns"
          :checkValue="$store.state.ui.lastTrns === 'visible'"
          v-on:onClick="$store.dispatch('tooglevisibleLastTrns')"
          v-on:onClose="visibleCustomizeMenu = !visibleCustomizeMenu")
        ContextMenuItem(
          icon="mdi mdi-chart-bubble"
          title="Cats chart"
          :checkValue="$store.state.ui.catsChart === 'visible'"
          v-on:onClick="$store.dispatch('toogleVisibleCatsChart')"
          v-on:onClose="visibleCustomizeMenu = !visibleCustomizeMenu")
        ContextMenuItem(
          icon="mdi mdi-chart-gantt"
          title="Cats stat"
          :checkValue="$store.state.ui.statItems === 'visible'"
          v-on:onClick="$store.dispatch('toogleVisibilityStatItems')"
          v-on:onClose="visibleCustomizeMenu = !visibleCustomizeMenu")
        .context-menu-sep
        ContextMenuItem(
          icon="mdi mdi-palette"
          title="Change theme"
          v-on:onClick="$store.dispatch('changeTheme')")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/scrollbar"

.customize
  padding 0 $m7
  padding-bottom $m9
  margin-top $m9

.stat
  &__filter
    padding $m8 $m7

  &__charts
    padding-bottom $m7
    &:last-child
      padding-bottom $m5

.statGroup
  padding-top $m9

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
