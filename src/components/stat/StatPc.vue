<script>
import Amount from '@/components/amount/Amount'
import EmptyData from '@/components/shared/emptyData/EmptyData'
import StatItem from '@/components/stat/StatItem'
import PeriodCatsChart from '@/components/stat/cats/PeriodCatsChart'

export default {
  components: {
    Amount,
    EmptyData,
    PeriodCatsChart,
    StatItem
  },

  computed: {
    stat () {
      return this.$store.getters.stat
    }
  }
}
</script>

<template lang="pug">
.stat
  .stat__content(v-if="stat.expenses.categoriesIds.length > 0 || stat.incomes.categoriesIds.length > 0")
    //- expenses
    //------------------------------------------------
    .stat__item
      template(v-if="stat.expenses.categoriesIds.length")
        .stat__chart(v-if="$store.state.ui.catsChart === 'visible'")
          PeriodCatsChart(type="expenses")

        .stat__cats
          StatItem(
            v-for="categoryId in stat.expenses.categoriesIds"
            :biggest="stat.expenses.biggest"
            :category="$store.state.categories.items[categoryId]"
            :categoryId="categoryId"
            :currency="$store.state.currencies.base"
            :type="0"
            :key="categoryId"
            :total="stat.categories[categoryId].expenses")
      .stat__empty(v-else) No expenses

    //- incomes
    //------------------------------------------------
    .stat__item
      template(v-if="stat.incomes.categoriesIds.length")
        .stat__chart(v-if="$store.state.ui.catsChart === 'visible'")
          PeriodCatsChart(type="incomes")

        .stat__cats
          StatItem(
            v-for="categoryId in stat.incomes.categoriesIds"
            :biggest="stat.incomes.biggest"
            :category="$store.state.categories.items[categoryId]"
            :categoryId="categoryId"
            :currency="$store.state.currencies.base"
            :type="1"
            :key="categoryId"
            :total="stat.categories[categoryId].incomes")
      .stat__empty(v-else) No incomes

  //- empty
  //------------------------------------------------
  EmptyData(
    v-else
    text="No stat for this period")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.stat
  position relative
  padding 0 $m10

  &__content
    display grid
    grid-template-columns repeat(auto-fit, minMax(450px, 1fr))

    @media $media-pc
      grid-column-gap $mb1

    @media $media-xl
      grid-column-gap $mb2

  &__item
    overflow hidden
    flex 1 1 450px
    padding 0 24px
    padding-top $m10

  &__chart
    @media $media-laptop
      padding-bottom $m7

  &__cats
    max-width 470px

    @media $media-laptop
      padding-top $m7

  &__empty
    padding $m9
    color var(--c-font-4)
    background var(--c-bg-3)

    @media $media-laptop
      text-align center
</style>
