<script>
import localforage from 'localforage'

export default {
  name: 'HistoryPage'
}
</script>

<template lang="pug">
LayoutMobileWrap
  //- Wallets
  //---------------------------------------------------------------------------
  template(v-if="activeTab === 'wallets'")
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
  .page(v-if="activeTab === 'stat'")
    .page__content.pageScrollerJsContent

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
              v-if="statAverage.incomes !== 0"
              :class="{ _active: activeTabViewName === 'incomes' }"
              @click="onClickTopMenu('incomes')"
            ) {{ $t('money.incomes') }}
            .switcher2__item(
              v-if="statAverage.expenses !== 0"
              :class="{ _active: activeTabViewName === 'expenses' }"
              @click="onClickTopMenu('expenses')"
            ) {{ $t('money.expenses') }}
            .switcher2__item(
              :class="{ _active: activeTabViewName === 'history' }"
              @click="onClickTopMenu('history')"
            ) {{ $t('trns.history') }}
            .switcher2__item(
              @click="$store.dispatch('ui/changeTheme')"
            ) {{ $t('theme.title') }}

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

      template(v-if="activeTabViewName === 'history'")
        .box
          TrnsList3

      template(v-if="activeTabViewName === 'chart'")
        .page__grid
          .box._h272(
            v-if="filterPeriod !== 'all'"
            v-show="activeTabViewName !== 'history'"
          )
            StatChartDonut2(
              v-if="filterPeriod !== 'all'"
              :isShowIncomes="activeTabViewName === 'incomes' || activeTabViewName === 'chart'"
              :isShowExpenses="activeTabViewName === 'expenses' || activeTabViewName === 'chart'"
              :key="activeTabViewName + period + filterPeriod + $store.state.chart.periods[filterPeriod].showedPeriods + this.$store.state.filter.categoryId + this.$store.state.filter.walletId"
            )
            ChartMenu2

          .box._periods
            .periods
              .periodItem(@click="removePeriodOrGroup"): .mdi.mdi-minus
              .periodItem(
                v-for="periodItem in periodsNames"
                :key="periodItem.slug"
                :class="{ _active: $store.state.filter.period === periodItem.slug }"
                @click="$store.dispatch('filter/setPeriod', periodItem.slug)"
              )
                .periodItem__count(
                  v-if="filterPeriod !== 'all'"
                ) {{ $store.state.chart.periods[periodItem.slug].showedPeriods }}
                .periodItem__name {{ periodItem.name }}
              .periodItem(@click="addPeriodOrGroup"): .mdi.mdi-plus

          //- Period Selector
          //---------------------------
          .box__nav._noMargin
            ContextMenu(
              :position="{ right: '-50px', top: '38px' }"
              :visible="isShowPeriodsNames"
              @onClickOpener="isShowPeriodsNames = !isShowPeriodsNames"
            )
              template(slot="opener")
                Dropdown._noBd.date(:active="isShowPeriodsNames")
                  template(slot="title")
                    Date

              template(slot="content")
                ContextMenuItem(
                  :selected="$store.state.filter.period === 'day'"
                  :title="$t('dates.day.simple')"
                  icon="mdi mdi-weather-sunset-up"
                  @onClick="$store.dispatch('filter/setPeriod', 'day')"
                  @onClose="isShowPeriodsNames = !isShowPeriodsNames"
                )
                ContextMenuItem(
                  :selected="$store.state.filter.period === 'week'"
                  :title="$t('dates.week.simple')"
                  icon="mdi mdi-calendar-week"
                  @onClick="$store.dispatch('filter/setPeriod', 'week')"
                  @onClose="isShowPeriodsNames = !isShowPeriodsNames"
                )
                ContextMenuItem(
                  :selected="$store.state.filter.period === 'month'"
                  :title="$t('dates.month.simple')"
                  icon="mdi mdi-calendar"
                  @onClick="$store.dispatch('filter/setPeriod', 'month')"
                  @onClose="isShowPeriodsNames = !isShowPeriodsNames"
                )
                ContextMenuItem(
                  :selected="$store.state.filter.period === 'year'"
                  :title="$t('dates.year.simple')"
                  icon="mdi mdi-calendar-star"
                  @onClick="$store.dispatch('filter/setPeriod', 'year')"
                  @onClose="isShowPeriodsNames = !isShowPeriodsNames"
                )
                ContextMenuItem(
                  :selected="$store.state.filter.period === 'all'"
                  :title="$t('dates.all.simple')"
                  icon="mdi mdi-database"
                  @onClick="$store.dispatch('filter/setPeriod', 'all')"
                  @onClose="isShowPeriodsNames = !isShowPeriodsNames"
                )

          //- Filter
          //---------------------------
          .page__filter(v-if="isShowFilter")
            FilterRow

          //- Incomes
          //---------------------------
          template(v-if="statAverage.incomes !== 0")
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
                LazyStatItem(
                  v-if="$store.state.ui.pc"
                  v-for="categoryId in statCurrentPeriod.incomes.categoriesIds"
                  :biggest="statCurrentPeriod.incomes.biggest"
                  :category="$store.state.categories.items[categoryId]"
                  :categoryId="categoryId"
                  :currency="$store.state.currencies.base"
                  :key="categoryId"
                  :total="statCurrentPeriod.categories[categoryId].incomes"
                  :type="1"
                )
                LazyStatItemMobile(
                  v-if="$store.state.ui.mobile"
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
          template(v-if="statAverage.expenses !== 0")
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
                LazyStatItem(
                  v-if="$store.state.ui.pc"
                  v-for="categoryId in statCurrentPeriod.expenses.categoriesIds"
                  :biggest="statCurrentPeriod.expenses.biggest"
                  :category="$store.state.categories.items[categoryId]"
                  :categoryId="categoryId"
                  :currency="$store.state.currencies.base"
                  :key="categoryId"
                  :total="statCurrentPeriod.categories[categoryId].expenses"
                  :type="0"
                )
                LazyStatItemMobile(
                  v-if="$store.state.ui.mobile"
                  v-for="categoryId in statCurrentPeriod.expenses.categoriesIds"
                  :biggest="statCurrentPeriod.expenses.biggest"
                  :category="$store.state.categories.items[categoryId]"
                  :categoryId="categoryId"
                  :currency="$store.state.currencies.base"
                  :key="categoryId"
                  :total="statCurrentPeriod.categories[categoryId].expenses"
                  :type="0"
                )

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
            ContextMenu(
              :position="{ right: '-50px', top: '38px' }"
              :visible="isShowPeriodsNames"
              @onClickOpener="isShowPeriodsNames = !isShowPeriodsNames"
            )
              template(slot="opener")
                Dropdown._noBd.date(:active="isShowPeriodsNames")
                  template(slot="title")
                    Date(
                      :type="activeTabStat === 'incomes' ? 1 : 0"
                    )

              template(slot="content")
                ContextMenuItem(
                  :selected="$store.state.filter.period === 'day'"
                  :title="$t('dates.day.simple')"
                  icon="mdi mdi-weather-sunset-up"
                  @onClick="$store.dispatch('filter/setPeriod', 'day')"
                  @onClose="isShowPeriodsNames = !isShowPeriodsNames"
                )
                ContextMenuItem(
                  :selected="$store.state.filter.period === 'week'"
                  :title="$t('dates.week.simple')"
                  icon="mdi mdi-calendar-week"
                  @onClick="$store.dispatch('filter/setPeriod', 'week')"
                  @onClose="isShowPeriodsNames = !isShowPeriodsNames"
                )
                ContextMenuItem(
                  :selected="$store.state.filter.period === 'month'"
                  :title="$t('dates.month.simple')"
                  icon="mdi mdi-calendar"
                  @onClick="$store.dispatch('filter/setPeriod', 'month')"
                  @onClose="isShowPeriodsNames = !isShowPeriodsNames"
                )
                ContextMenuItem(
                  :selected="$store.state.filter.period === 'year'"
                  :title="$t('dates.year.simple')"
                  icon="mdi mdi-calendar-star"
                  @onClick="$store.dispatch('filter/setPeriod', 'year')"
                  @onClose="isShowPeriodsNames = !isShowPeriodsNames"
                )
                ContextMenuItem(
                  :selected="$store.state.filter.period === 'all'"
                  :title="$t('dates.all.simple')"
                  icon="mdi mdi-database"
                  @onClick="$store.dispatch('filter/setPeriod', 'all')"
                  @onClose="isShowPeriodsNames = !isShowPeriodsNames"
                )

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

          .box(v-if="$store.state.ui.catsChart === 'visible' && statCurrentPeriod[activeTabStat].categoriesIds.length > 1")
            //- .box__title Periods
            .box__content
              PeriodCatsChart(:type="activeTabStat")

          .box(v-if="$store.state.ui.statItems === 'visible' && statCurrentPeriod[activeTabStat].categoriesIds.length > 1")
            //- .box__title Categories
            .box__content
              LazyStatItem(
                v-if="$store.state.ui.pc"
                v-for="categoryId in statCurrentPeriod[activeTabStat].categoriesIds"
                :biggest="statCurrentPeriod[activeTabStat].biggest"
                :category="$store.state.categories.items[categoryId]"
                :categoryId="categoryId"
                :currency="$store.state.currencies.base"
                :key="categoryId"
                :total="statCurrentPeriod.categories[categoryId][activeTabStat]"
                :type="activeTabStat === 'incomes' ? 1 : 0"
              )
              LazyStatItemMobile(
                v-if="$store.state.ui.mobile"
                v-for="categoryId in statCurrentPeriod[activeTabStat].categoriesIds"
                :biggest="statCurrentPeriod[activeTabStat].biggest"
                :category="$store.state.categories.items[categoryId]"
                :categoryId="categoryId"
                :currency="$store.state.currencies.base"
                :key="categoryId"
                :total="statCurrentPeriod.categories[categoryId][activeTabStat]"
                :type="activeTabStat === 'incomes' ? 1 : 0"
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
</template>

<style lang="stylus">
@import '~assets/stylus/variables'

.highcharts-crosshair
  cursor pointer

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
  display flex
  align-items center
  margin -1px 0
  background var(--c-bg-5)

  +media-tablet()
    background var(--c-bg-4)

.periodItem
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
    padding-right $m4

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
  // background var(--c-bg-3)

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
    // padding-top $m4
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
