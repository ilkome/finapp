<script>
import { computed, useContext } from '@nuxtjs/composition-api'
import useUIView from '~/components/layout/useUIView'
import useStat from '~/modules/stat/useStat'

export default {
  setup () {
    const { store } = useContext()
    const { ui } = useUIView()

    // Stat
    const statCurrentPeriod = computed(() => store.getters['stat/statCurrentPeriod'])
    const { moneyTypes } = useStat()

    return {
      ui,

      statCurrentPeriod,
      moneyTypes
    }
  }
}
</script>

<template lang="pug">
.stat
  .stat__content
    //- Loop throw incomes / expenses
    .statItemPc(
      v-for="item in moneyTypes"
      :key="item.type"
    )
      .stat__empty(v-if="!statCurrentPeriod[item.id].categoriesIds.length") No data

      template(v-if="statCurrentPeriod[item.id].categoriesIds.length")
        //- Pie chart
        .statChartPie(v-if="ui.showPieChart")
          LazyStatChartPie(
            v-if="ui.showPieChart && statCurrentPeriod[item.id].categoriesIds.length"
            :amountType="item.id"
          )

        //- Cats vertical chart
        .statCatsPeriodCatsChart(v-if="ui.showCatsVerticalChart")
          LazyStatCatsPeriodCatsChart(
            v-if="ui.showCatsVerticalChart"
            :type="item.id"
          )

        //- Round cats list
        .statItemsTiles(v-if="ui.showRoundCats && statCurrentPeriod[item.id].categoriesIds.length > 0")
          LazyStatItemRound(
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
        .stat__cats(v-if="ui.showCatsHorizontalList")
          StatItem(
            v-for="categoryId in statCurrentPeriod[item.id].categoriesIds"
            :biggest="statCurrentPeriod[item.id].biggest"
            :category="$store.state.categories.items[categoryId]"
            :categoryId="categoryId"
            :currency="$store.state.currencies.base"
            :type="item.type"
            :key="categoryId"
            :total="statCurrentPeriod.categories[categoryId][item.id]")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'

.stat
  position relative
  padding 0 60px
  padding-top $m9

  &__content
    display grid
    grid-template-columns repeat(auto-fill, minmax(280px, 47%))
    grid-column-gap $m10
    grid-row-gap $m10

  &__chart
    display flex
    @media $media-laptop
      padding-bottom 12px

  &__cats
    max-width 380px

    @media $media-laptop
      padding-top $m7

  &__empty
    padding $m10
    color var(--c-font-4)

    @media $media-laptop
      text-align center

// ------------------------------------
.statItemsTiles
  display grid
  grid-template-columns repeat(auto-fill, minmax(80px, 1fr))
  grid-column-gap 0
  grid-row-gap 0

// ------------------------------------
.statCatsPeriodCatsChart
  padding-bottom $m7
</style>
