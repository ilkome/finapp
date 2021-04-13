<script lang="ts">
import dayjs from 'dayjs'
import { computed, useContext } from '@nuxtjs/composition-api'
import useUIView from '~/components/layout/useUIView'

export default {
  name: 'StatMobile',

  setup () {
    const { store } = useContext()

    const activeTabViewName = computed(() => store.state.ui.activeTabViewName)
    const activeTab = computed(() => store.state.ui.activeTab)
    const activeTabStat = computed(() => store.state.ui.activeTabStat)
    const statPage = computed(() => activeTabViewName.value === 'stat')
    const statCurrentPeriod = computed(() => store.getters['stat/statCurrentPeriod'])
    const statAverage = computed(() => store.getters['stat/statAverage'])
    const filterPeriod = computed(() => store.state.filter.period)
    const isShowFilter = computed(() => !!store.state.filter.categoryId || !!store.state.filter.walletId)
    const periods = computed(() => store.state.chart.periods)
    const isShowChart = computed(() => store.getters['trns/hasTrns'] && filterPeriod.value !== 'all')

    // UI
    const { ui, setUI } = useUIView()

    // Incomes Expenses
    const moneyTypes = [{
      id: 'expenses',
      type: 0
    }, {
      id: 'incomes',
      type: 1
    }]

    const statToday = computed(() => {
      return store.getters['stat/getStat']({
        date: dayjs().valueOf(),
        periodName: 'day'
      })
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

      statToday
    }
  }
}
</script>

<template lang="pug">
.pageWrap
  .baseBox(v-if="ui.showMainChart && isShowChart")
    LazyChartMobileStatLines(v-if="ui.showMainChart && isShowChart")

  .baseBox._noBg
    DateMobileSelector

  .baseBox._noBg(v-if="isShowFilter")
    LazyFilterRow(v-if="isShowFilter")

  template(v-if="activeTabStat !== 'history'")
    .baseBox._noBd
      .boxFlew2(:class="{ _double: statAverage.incomes !== 0 && statAverage.expenses !== 0 }")
        .boxFlew2Item(v-if="statAverage.incomes !== 0")
          StatCatsPeriodCatsChartMobile(type="incomes")
        .boxFlew2Item(v-if="statAverage.expenses !== 0")
          StatCatsPeriodCatsChartMobile(type="expenses")

    //- Loop throw incomes / expenses
    template(
      v-for="item in moneyTypes"
      v-if="activeTabStat === 'details' || (activeTabStat === 'incomes' && item.id === 'incomes') || (activeTabStat === 'expenses' && item.id === 'expenses')"
    )
      template(v-if="statAverage && statAverage[item.id] !== 0")
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
              v-if="statToday[item.id].total !== 0 && $store.state.filter.period !== 'day'"
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
          .statItemsTiles(v-if="ui.showRoundCats && statCurrentPeriod[item.id].categoriesIds.length > 0")
            LazyStatItemMobile2(
              v-if="ui.showRoundCats && statCurrentPeriod[item.id].categoriesIds.length > 0"
              v-for="categoryId in statCurrentPeriod[item.id].categoriesIds"
              :biggest="statCurrentPeriod[item.id].biggest"
              :category="$store.state.categories.items[categoryId]"
              :categoryId="categoryId"
              :currency="$store.state.currencies.base"
              :key="categoryId"
              :total="statCurrentPeriod.categories[categoryId][item.id]"
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

.pageWrap
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
    color var(--c-font-4)
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
