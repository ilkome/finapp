<script lang="ts">
import dayjs from 'dayjs'
import { computed, useContext } from '@nuxtjs/composition-api'
import getStat from '~/modules/stat/getStat'
import useChart from '~/components/chart/useChart'
import useFilter from '~/modules/filter/useFilter'
import useStat from '~/modules/stat/useStat'
import useTrns from '~/modules/trns/useTrns'
import useUIView from '~/components/layout/useUIView'

export default {
  name: 'StatDashboard',

  setup () {
    const { store, app: { $day } } = useContext()
    const { getTrnsIds } = useTrns()
    const { getStatBy } = getStat()
    const { filterPeriodNameAllReplacedToYear } = useFilter()

    // Chart
    const { isShowDataLabels, toogleChartsView } = useChart()

    const activeTabStat = computed(() => store.state.ui.activeTabStat)
    const statCurrentPeriod = computed(() => store.getters['stat/statCurrentPeriod'])
    const statAverage = computed(() => store.getters['stat/statAverage'])
    const filterPeriod = computed(() => store.state.filter.period)
    const filter = computed(() => store.state.filter)
    const filterDate = computed(() => store.state.filter.date)
    const isShowFilter = computed(() => !!store.state.filter.categoryId || !!store.state.filter.walletId)
    const periods = computed(() => store.state.chart.periods)
    const isShowChart = computed(() => store.getters['trns/hasTrns'])

    // UI
    const { ui, setUI } = useUIView()

    // Stat
    const { moneyTypes, isEmptyStat } = useStat()

    // Last selected period
    const isFirstPeriodSelected = computed(() => store.getters['stat/isFirstPeriodSelected'])

    // Stat today
    const statToday = computed(() => {
      if (!isFirstPeriodSelected.value || filterPeriod.value !== 'day') {
        return store.getters['stat/getStat']({
          date: dayjs().valueOf(),
          periodName: 'day'
        })
      }
      return null
    })

    // Current and last period
    const currentAndLastPeriodTrnsIds = computed(() => getTrnsIds({
      walletId: computed(() => store.state.filter.walletId).value,
      categoryId: computed(() => store.state.filter.categoryId).value,
      date: {
        from: $day(filterDate.value).subtract(2, filterPeriod.value).valueOf(),
        to: $day(filterDate.value).valueOf()
      }
    }))
    const currentAndLastPeriodStat = computed(() => getStatBy(currentAndLastPeriodTrnsIds.value))

    // Stat with last periods
    const statWithLastPeriods = computed(() => {
      if (!isFirstPeriodSelected.value)
        return statCurrentPeriod.value

      const cats = computed(() => store.state.categories.items)
      let stat = JSON.parse(JSON.stringify(statCurrentPeriod.value))

      let incomesIDs = []
      let expensesIDs = []

      for (const catId in currentAndLastPeriodStat.value.categories) {
        if (filter.value.categoryId) break
        if (!statCurrentPeriod.value.categories[catId]) {
          stat.categories[catId] = {
            expenses: 0,
            incomes: 0,
            total: 0
          }
          if (currentAndLastPeriodStat.value.expenses.categoriesIds.find(id => id === catId))
            expensesIDs.push(catId)

          if (currentAndLastPeriodStat.value.incomes.categoriesIds.find(id => id === catId))
            incomesIDs.push(catId)
        }
      }

      incomesIDs = incomesIDs.sort((a, b) => {
        if (cats.value[a].name < cats.value[b].name) return -1
        if (cats.value[a].name > cats.value[b].name) return 1
        return 0
      })
      expensesIDs = expensesIDs.sort((a, b) => {
        if (cats.value[a].name < cats.value[b].name) return -1
        if (cats.value[a].name > cats.value[b].name) return 1
        return 0
      })

      stat = {
        ...stat,
        incomes: {
          ...stat.incomes,
          categoriesIds: [...stat.incomes.categoriesIds, ...incomesIDs]
        },
        expenses: {
          ...stat.expenses,
          categoriesIds: [...stat.expenses.categoriesIds, ...expensesIDs]
        }
      }

      return stat
    })

    const onClickTitle = (type) => {
      if (activeTabStat.value === 'details')
        store.dispatch('ui/setActiveTabStat', type === 0 ? 'expenses' : 'incomes')
      else
        store.dispatch('ui/setActiveTabStat', 'details')
    }

    function toogleView (name) {
      setUI({ name, value: !ui[name] })
    }

    return {
      isShowDataLabels,
      toogleChartsView,

      filterPeriodNameAllReplacedToYear,

      isShowChart,

      activeTabStat,
      statCurrentPeriod,
      statAverage,
      filter,
      filterPeriod,
      isShowFilter,
      periods,

      ui,
      setUI,

      moneyTypes,

      statToday,
      statWithLastPeriods,

      isEmptyStat,

      onClickTitle,

      toogleView
    }
  }
}
</script>

<template lang="pug">
.pageWrapScroll
  .baseBox._date(v-if="activeTabStat !== 'history'")
    StatPeriodArrows
    StatPeriodSelector

  //-
  //- Chart graph
  //-
  .baseBox._total(v-if="activeTabStat !== 'history'")
    .baseBoxIn
      //- Control
      ChartPeriods

      //- Graph
      .baseBox._chart(v-if="ui.showMainChart && isShowChart")
        LazyChartTotal(v-if="ui.showMainChart && isShowChart")

  //- Controls
  .statWiews(v-if="activeTabStat !== 'history'")
    .periodItem(
      :class="{ _active: ui.showPieChart }"
      @click="toogleView('showPieChart')"
    ): .mdi.mdi-chart-pie

    .periodItem(
      :class="{ _active: ui.showCatsVerticalChart }"
      @click="toogleView('showCatsVerticalChart')"
    ): .mdi.mdi-poll

    .periodItem(
      :class="{ _active: ui.showRoundCats }"
      @click="toogleView('showRoundCats')"
    ): .mdi.mdi-chart-bubble

    .periodItem(
      :class="{ _active: ui.showCatsHorizontalList }"
      @click="toogleView('showCatsHorizontalList')"
    ): .mdi.mdi-chart-timeline

    template(v-if="!isEmptyStat")
      .periodItem(@click="toogleChartsView")
        .mdi.mdi-chart-line(v-if="periods[filterPeriodNameAllReplacedToYear].grouped")
        .mdi.mdi-chart-bar(v-else)

      .periodItem(@click="isShowDataLabels = !isShowDataLabels")
        .mdi.mdi-subtitles-outline

  //-
  //-
  //-
  .totalSum(v-if="activeTabStat !== 'history'")
    template(v-if="(activeTabStat === 'details' || activeTabStat === 'history') && $store.state.filter.period !== 'all'")
      div
        .baseBox__title {{ $t('money.total') }}
        .boxSummary2
          .boxSummary2__item
            Amount(
              :currency="$store.state.currencies.base"
              :type="(statCurrentPeriod.incomes.total - statCurrentPeriod.expenses.total) > 0 ? 1 : 0"
              :value="statCurrentPeriod.incomes.total - statCurrentPeriod.expenses.total"
              size="xl"
              vertical="left"
            )
          LazyStatSummaryRowItemView(
            v-if="statAverage.incomes - statAverage.expenses !== 0"
            :type="(statAverage.incomes - statAverage.expenses) > 0 ? 1 : 0"
            :amount="statAverage.incomes - statAverage.expenses"
            :title="$t('money.averageTotal')"
          )

    template(v-else-if="$store.state.filter.period !== 'all'")
      div
        .baseBox__title {{ $t('money.total') }}
        .boxSummary2
          .boxSummary2__item
            Amount(
              :currency="$store.state.currencies.base"
              :type="activeTabStat === 'incomes' ? 1 : 0"
              :value="statCurrentPeriod[activeTabStat].total"
              size="xl"
              vertical="left"
            )
          LazyStatSummaryRowItemView(
            v-if="statAverage[activeTabStat] !== 0"
            :type="activeTabStat === 'incomes' ? 1 : 0"
            :amount="statAverage[activeTabStat]"
            :title="$t('money.averageTotal')"
          )

  //-
  //- Menu
  //-
  StatDashboardMenu

  //-
  //- Filter
  //-
  .baseBox._filter(v-if="isShowFilter")
    LazyFilterRow(v-if="isShowFilter")

  //-
  //- No stat
  //-
  .noStat(v-if="isEmptyStat")
    .noStat__title {{ $t('stat.empty') }}
    .noStat__desc {{ $t('stat.emptyDesc') }}

  //-
  //- Loop throw incomes / expenses
  //-
  .statMoneyTypes(v-if="activeTabStat !== 'history'")
    template(
      v-for="item in moneyTypes"
      v-if="activeTabStat === 'details' || (activeTabStat === 'incomes' && item.id === 'incomes') || (activeTabStat === 'expenses' && item.id === 'expenses')"
    )
      template(v-if="statCurrentPeriod[item.id].total > 0 || (statAverage && statAverage[item.id] !== 0) || $store.state.filter.period === 'all'")
        .baseBox._noBdMedia._mw
          template(v-if="activeTabStat === 'details'")
            .sumBox
              .baseBox__title {{ $t(`money.${item.id}`) }}
              .boxSummary2
                //- Summary
                .boxSummary2__item(@click="onClickTitle(item.type)")
                  Amount(
                    :currency="$store.state.currencies.base"
                    :type="item.type"
                    :value="statCurrentPeriod[item.id].total"
                    size="xl"
                    vertical="left"
                  )
                //- Average
                LazyStatSummaryRowItemView(
                  v-if="statAverage[item.id] !== 0"
                  :type="item.type"
                  :amount="statAverage[item.id]"
                  :title="$t(`money.average.${item.id}`)"
                )
                //- Today
                LazyStatSummaryRowItemView(
                  v-if="statToday && statToday[item.id].total !== 0"
                  :type="item.type"
                  :amount="statToday[item.id].total"
                  :title="$t('dates.day.today')"
              )

          .boxEmpty(v-if="statCurrentPeriod[item.id].categoriesIds.length === 0") {{ $t('stat.empty') }}

          //- Pie chart
          .statChartPie(v-if="ui.showPieChart")
            LazyStatChartPie(
              v-if="ui.showPieChart && statCurrentPeriod[item.id].categoriesIds.length"
              :amountType="item.id"
            )

          //- Cats vertical chart
          StatCatsPeriodCatsChart(
            v-if="ui.showCatsVerticalChart && !filter.categoryId && statCurrentPeriod[item.id].categoriesIds.length > 1 && (!filter.categoryId || filter.categoryId && $store.getters['categories/getChildCategoriesIds'](filter.categoryId).length !== 0)"
            :type="item.id"
          )

          //- Round cats list
          .statItemsTiles(v-if="ui.showRoundCats && (!filter.categoryId || filter.categoryId && $store.getters['categories/getChildCategoriesIds'](filter.categoryId).length !== 0)")
            LazyStatItemRound(
              v-if="ui.showRoundCats"
              v-for="categoryId in statCurrentPeriod[item.id].categoriesIds"
              :category="$store.state.categories.items[categoryId]"
              :categoryId="categoryId"
              :currency="$store.state.currencies.base"
              :key="categoryId"
              :total="statWithLastPeriods.categories[categoryId][item.id]"
              :type="item.type"
            )
            template(v-if="filter.categoryId")
              template(v-for="categoryId in $store.getters['categories/getChildCategoriesIds'](filter.categoryId)")
                template(v-if="!statCurrentPeriod[item.id].categoriesIds.includes(categoryId)")
                  LazyStatItemRound(
                    v-if="filter.categoryId"
                    :category="$store.state.categories.items[categoryId]"
                    :categoryId="categoryId"
                    :currency="$store.state.currencies.base"
                    :key="categoryId"
                    :total="0"
                    :type="item.type"
                  )

          //- Cats horizontal list
          .statCategories(v-if="ui.showCatsHorizontalList && statCurrentPeriod[item.id].categoriesIds.length > 0 ")
            LazyStatItem(
              v-if="ui.showCatsHorizontalList && statCurrentPeriod[item.id].categoriesIds.length > 0"
              v-for="categoryId in statCurrentPeriod[item.id].categoriesIds"
              :key="categoryId"
              :biggest="statCurrentPeriod[item.id].biggest"
              :category="$store.state.categories.items[categoryId]"
              :categoryId="categoryId"
              :currency="$store.state.currencies.base"
              :total="statCurrentPeriod.categories[categoryId][item.id]"
              :type="item.type"
            )

    template(v-if="!isEmptyStat && (activeTabStat !== 'history' && statAverage && (statAverage.incomes === 0 || statAverage.expenses === 0)) || (activeTabStat === 'incomes' && statAverage.incomes !== 0 || activeTabStat === 'expenses'  && statAverage.expenses !== 0)")
      .baseBox._mw(v-if="$store.getters['trns/selectedTrnsIdsWithDate'].length > 0")
        .baseBox__title {{ $t('trns.inPeriodTitle') }}
        .baseBox__content
          TrnsList3(
            :incomes="activeTabStat === 'incomes'"
            :expenses="activeTabStat === 'expenses'"
            :size="12"
          )

  //- history
  .history(v-if="activeTabStat !== 'history' && statAverage && (statAverage.incomes !== 0 && statAverage.expenses !== 0) && ui.showHistory && $store.getters['trns/selectedTrnsIdsWithDate'].length > 0 && (activeTabStat !== 'incomes' && activeTabStat !== 'expenses')")
    .baseBox__title(v-if="activeTabStat !== 'history'") {{ $t('trns.inPeriodTitle') }}
    TrnsList(
      :size="50"
      :isShowFilter="activeTabStat === 'history'"
    )

  .history(v-if="activeTabStat === 'history'")
    TrnsListHistory(
      :size="50"
      isShowFilter
    )
</template>

<style lang="stylus">
@import '~assets/stylus/variables'

.statChartLines
  padding-top $m6
  padding-bottom $m7

// ------------------------------------
.history
  margin $m5 0
  padding $m5 $m7

  +media(700px)
    padding $m8 $m8

  .baseBox__title
    margin-bottom (- $m8)
    +media(600px)
      margin-bottom 0

  .trnsList__content
    .trnsList__header
      margin 0 (- $m5)
      +media(600px)
        margin 0

    .trnsList__trns
      margin 0 (- $m5)
      padding 0 0

    .trnsList__grid
      padding 0

      .trnsList__day
        padding-bottom 0

  .trnItem._history
    margin 0
    padding-right $m7 !important
    padding-left $m7 !important
</style>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.totalSum
  padding 0 $m6

.statWiews
  display flex
  justify-content flex-end
  margin-bottom (- $m5)
  padding 0 $m6
  padding-top $m4

  .periodItem
    padding $m5
    color var(--c-font-5)
    font-size 18px
    border-radius $m5

    &._active
      color var(--c-font-3)

    +media-hover()
      background var(--c-bg-5)

.sumBox
  cursor pointer
  position relative
  display inline-block
  width 100%

.noStat
  overflow hidden
  padding $m10 $m7
  color var(--c-font-3)
  text-align center

  &__title
    padding-bottom $m6
    font-size 22px

  &__desc
    color var(--c-font-4)
    font-size 14px

// ------------------------------------
.pageWrapScroll
  overflow hidden
  overflow-y auto
  scrollbar()
  height 100%

  +media(800px)
    padding-right 40px

// ------------------------------------
.statMoneyTypes
  align-items start

  +media(700px)
    display grid
    grid-template-columns 1fr 1fr
    grid-column-gap 0px
    grid-row-gap 64px

    +media(800px)
      grid-column-gap 32px
      padding-top $m7

  .baseBox:last-child
    border none

// ------------------------------------
.boxFlew2
  &._double
    display grid
    grid-template-columns 1fr 1fr
    grid-column-gap $m7

  &__item
    overflow hidden
    border-radius $m6

// ------------------------------------
.baseBox
  overflow hidden
  margin $m5 0
  padding $m5 $m7
  border-bottom 1px solid var(--c-bg-7)

  +media(700px)
    padding $m8 $m8
    border-bottom 1px solid var(--c-bg-5)

  &._mw
    overflow initial
    max-width 400px
    margin-top 0
    padding-top $m7

  &._noBdMedia
    +media(700px)
      position sticky
      top 0
      border none

  &._noBg
    padding-bottom 0
    background none
    border none

  &._noBd
    border none

  &._noBg
  &._noBd
    margin $m3 0
    padding $m3 $m4

    +media(700px)
      padding $m8 $m5

  &._date
    overflow initial
    margin-top 0
    margin-bottom 0
    padding-top 0
    padding-bottom 0
    background none
    border none

    +media(800px)
      padding-bottom 0

  &._chart
    overflow initial
    margin-top 0
    margin-bottom 0
    padding 0
    padding-right $m7
    background none
    border none

    +media(600px)
      padding-right $m8

  &._filter
    margin-top 0
    margin-bottom 0
    padding-top $m6
    padding-bottom $m6
    background none
    border none

  &._total
    margin-top 0
    margin-bottom 0
    padding-top 0
    padding-right 0
    padding-bottom 0
    padding-left $m5
    background none
    border none

    +media(800px)
      padding-bottom 0

  &__title
    z-index 9
    display flex
    align-items center
    padding $m6 $m6
    color var(--c-font-3)
    font-size 10px
    letter-spacing 1px
    font-weight 600
    text-transform uppercase

    +media(700px)
      padding-bottom $m6
      padding-left $m5
      font-secondary()
      font-size 18px

// ------------------------------------
.boxEmpty
  padding 0
  padding-top $m7
  padding-bottom $m10
  color var(--c-font-5)
  font-size 14px

// ------------------------------------
.boxSummary2
  overflow hidden
  overflow-y auto
  z-index 9
  display flex
  align-items center
  justify-content flex-start
  margin-bottom $m3
  padding 0 $m5
  padding-bottom $m5

  &._alt
    +media(800px)
      display block

  &__item
    padding-right $m9

    &._alt
      +media(800px)
        padding-right 0
        padding-bottom $m9

// ------------------------------------
.statItemsTiles
  display grid
  grid-template-columns repeat(auto-fill, minmax(80px, 1fr))
  grid-column-gap 0
  grid-row-gap 0
  padding-bottom $m7

.statCategories
  max-width 400px
  padding $m7 $m5
  padding-top 0

// ------------------------------------
.pageAnalytics
  padding $m7 $m5

// ------------------------------------
.boxSwitcher
  max-width 640px
  margin 0 auto
</style>
