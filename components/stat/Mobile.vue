<script lang="ts">
import dayjs from 'dayjs'
import { computed, useContext } from '@nuxtjs/composition-api'
import useUIView from '~/components/layout/useUIView'
import useStat from '~/modules/stat/useStat'
import getStat from '~/modules/stat/getStat'
import useTrns from '~/modules/trns/useTrns'

export default {
  name: 'StatMobile',

  setup () {
    const { store, app: { $day } } = useContext()
    const { getTrnsIds } = useTrns()
    const { getStatBy } = getStat()

    const activeTabViewName = computed(() => store.state.ui.activeTabViewName)
    const activeTab = computed(() => store.state.ui.activeTab)
    const activeTabStat = computed(() => store.state.ui.activeTabStat)
    const statPage = computed(() => activeTabViewName.value === 'stat')
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
    const { moneyTypes } = useStat()

    // Last selected period
    const isFirstPeriodSelected = computed(() => store.getters['stat/isFirstPeriodSelected'])

    // Stat today
    const statToday = computed(() => {
      if (!isFirstPeriodSelected.value) {
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
      if (!isFirstPeriodSelected.value) {
        return statCurrentPeriod.value
      }

      const cats = computed(() => store.state.categories.items)
      let stat = JSON.parse(JSON.stringify(statCurrentPeriod.value))

      let incomesIDs = []
      let expensesIDs = []

      for (const catId in currentAndLastPeriodStat.value.categories) {
        if (filter.value.categoryId) { break }
        if (!statCurrentPeriod.value.categories[catId]) {
          stat.categories[catId] = {
            expenses: 0,
            incomes: 0,
            total: 0
          }
          if (currentAndLastPeriodStat.value.expenses.categoriesIds.find(id => id === catId)) {
            expensesIDs.push(catId)
          }
          if (currentAndLastPeriodStat.value.incomes.categoriesIds.find(id => id === catId)) {
            incomesIDs.push(catId)
          }
        }
      }

      incomesIDs = incomesIDs.sort((a, b) => {
        if (cats.value[a].name < cats.value[b].name) { return -1 }
        if (cats.value[a].name > cats.value[b].name) { return 1 }
        return 0
      })
      expensesIDs = expensesIDs.sort((a, b) => {
        if (cats.value[a].name < cats.value[b].name) { return -1 }
        if (cats.value[a].name > cats.value[b].name) { return 1 }
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

    return {
      isShowChart,

      activeTabViewName,
      activeTab,
      activeTabStat,
      statPage,
      statCurrentPeriod,
      statAverage,
      filterPeriod,
      isShowFilter,
      periods,

      ui,
      setUI,

      moneyTypes,

      statToday,

      statWithLastPeriods
    }
  }
}
</script>

<template lang="pug">
.pageWrapScroll
  .baseBox(v-if="ui.showMainChart && isShowChart")
    LazyChartMobileStatLines(v-if="ui.showMainChart && isShowChart")

  .baseBox._noBg
    DateMobileSelector

  .baseBox._noBg(v-if="isShowFilter")
    LazyFilterRow(v-if="isShowFilter")

  template(v-if="activeTabStat !== 'history'")
    //- Total
    template(v-if="activeTabStat === 'details' && statAverage.incomes !== 0 && statAverage.expenses !== 0 && $store.state.filter.period !== 'all'")
      .baseBox
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
          StatSummaryRowItemView(
            :type="(statAverage.incomes - statAverage.expenses) > 0 ? 1 : 0"
            :amount="statAverage.incomes - statAverage.expenses"
            :title="$t('money.averageTotal')"
          )

    //- Loop throw incomes / expenses
    template(
      v-for="item in moneyTypes"
      v-if="activeTabStat === 'details' || (activeTabStat === 'incomes' && item.id === 'incomes') || (activeTabStat === 'expenses' && item.id === 'expenses')"
    )
      template(v-if="(statAverage && statAverage[item.id] !== 0) || $store.state.filter.period === 'all'")
        .baseBox
          .baseBox__title {{ $t(`money.${item.id}`) }}
          .boxSummary2
            .boxSummary2__item
              Amount(
                :currency="$store.state.currencies.base"
                :type="item.type"
                :value="statCurrentPeriod[item.id].total"
                size="xl"
                vertical="left"
              )
            StatSummaryRowItemView(
              :type="item.type"
              :amount="statAverage[item.id]"
              :title="$t(`money.average.${item.id}`)"
            )
            StatSummaryRowItemView(
              v-if="statToday && statToday[item.id].total !== 0 && $store.state.filter.period !== 'day'"
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
            v-if="ui.showCatsVerticalChart && $store.state.ui.catsChart === 'visible' && statCurrentPeriod[item.id].categoriesIds.length > 1"
            :type="item.id"
          )

          //- Round cats list
          .statItemsTiles(v-if="ui.showRoundCats && statWithLastPeriods[item.id].categoriesIds.length > 0")
            LazyStatItemRound(
              v-if="ui.showRoundCats && statWithLastPeriods[item.id].categoriesIds.length > 0"
              v-for="categoryId in statWithLastPeriods[item.id].categoriesIds"
              :biggest="statWithLastPeriods[item.id].biggest"
              :category="$store.state.categories.items[categoryId]"
              :categoryId="categoryId"
              :currency="$store.state.currencies.base"
              :key="categoryId"
              :total="statWithLastPeriods.categories[categoryId][item.id]"
              :type="item.type"
            )

          //- Cats horizontal list
          .statCategories(v-if="ui.showCatsHorizontalList && statCurrentPeriod[item.id].categoriesIds.length > 0")
            LazyStatItemMobile(
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

  .baseBox(v-if="ui.showHistory && $store.getters['trns/selectedTrnsIdsWithDate'].length > 0")
    .baseBox__title {{ $t('trns.history') }}
    .baseBox__content
      TrnsList3(
        :incomes="activeTabStat === 'incomes'"
        :expenses="activeTabStat === 'expenses'"
        :size="activeTabStat === 'history' ? 30 : 8"
      )

  //- Analytics
  //-----------------------------
  template(v-if="activeTabViewName === 'analytics'")
    .pageAnalytics
      Analytics
        template(#incomes)
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
            StatSummaryRowItemView(
              :type="1"
              :amount="statAverage.incomes"
              :title="$t('money.average.incomes')"
            )

        template(#expenses)
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
            StatSummaryRowItemView(
              :type="0"
              :amount="statAverage.expenses"
              :title="$t('money.average.expenses')"
            )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.pageWrapScroll
  overflow hidden
  overflow-y auto
  scrollbar()
  height 100%

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
  padding $m5 $m4
  border-bottom 1px solid var(--c-bg-7)

  &:first-child
    margin-top 0
    padding-top 0

  &:last-child
    border none

  &._noBg
    background none
    border none

  &._noBd
    border none

  &._noBg
  &._noBd
    margin $m3 0
    padding $m3 $m4

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

// ------------------------------------
.boxEmpty
  padding 0 $m7
  padding-top $m6
  padding-bottom $m10
  color var(--c-font-5)
  font-size 10px

// ------------------------------------
.boxSummary2
  z-index 9
  display flex
  align-items center
  justify-content flex-start
  margin-bottom $m3
  padding 0 $m5
  padding-bottom $m5

  &__item
    padding-right $m9

// ------------------------------------
.statItemsTiles
  display grid
  grid-template-columns repeat(auto-fill, minmax(80px, 1fr))
  grid-column-gap 0
  grid-row-gap 0

.statCategories
  padding $m7 $m5

// ------------------------------------
.pageAnalytics
  padding $m7 $m5

// ------------------------------------
.boxSwitcher
  max-width 640px
  margin 0 auto
</style>
