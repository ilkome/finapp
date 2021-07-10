<script>
import { computed, useContext } from '@nuxtjs/composition-api'
import dayjs from 'dayjs'
import useUIView from '~/components/layout/useUIView'
import useStat from '~/modules/stat/useStat'
import getStat from '~/modules/stat/getStat'
import useTrns from '~/modules/trns/useTrns'

export default {
  setup () {
    const { store, app: { $day } } = useContext()
    const { ui } = useUIView()

    // Stat
    const { moneyTypes } = useStat()
    const { getStatBy } = getStat()
    const { getTrnsIds } = useTrns()

    const statCurrentPeriod = computed(() => store.getters['stat/statCurrentPeriod'])
    const statAverage = computed(() => store.getters['stat/statAverage'])
    const filter = computed(() => store.state.filter)
    // const filterDate = computed(() => store.state.filter.date)
    const filterDate = computed(() => store.state.filter.date)
    const filterPeriod = computed(() => store.state.filter.period)

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

    return {
      ui,

      moneyTypes,

      statAverage,
      statCurrentPeriod,
      statToday,
      statWithLastPeriods
    }
  }
}
</script>

<template lang="pug">
//- Loop throw incomes / expenses
.statMoneyTypes
  template(
    v-for="item in moneyTypes"
  )
    template(v-if="(statAverage && statAverage[item.id] !== 0) || $store.state.filter.period === 'all'")
      .baseBox._noBdMedia._mw
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
          StatItem(
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

</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'
// ------------------------------------
.statMoneyTypes
  padding 0 32px

  +media(700px)
    display grid
    grid-template-columns 1fr 1fr
    grid-column-gap 96px
    grid-row-gap 64px

  .baseBox:last-child
    border none

// ------------------------------------
.baseBox
  overflow hidden
  margin $m5 0
  padding $m5 $m7
  border-bottom 1px solid var(--c-bg-7)

  +media(700px)
    padding $m8 $m8

  &._mw
    max-width 480px

  &._noBdMedia
    +media(700px)
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
      padding-bottom $m7
      font-secondary()
      font-size 18px

// ------------------------------------
.statItemsTiles
  display grid
  grid-template-columns repeat(auto-fill, minmax(80px, 1fr))
  grid-column-gap 0
  grid-row-gap 0

.statCategories
  padding $m7 $m5

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
</style>
