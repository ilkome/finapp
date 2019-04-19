<script>
import StatItem from '@/components/stat/StatItem'
import PeriodCatsChart from '@/components/stat/cats/PeriodCatsChart'

export default {
  components: {
    PeriodCatsChart,
    StatItem
  },

  computed: {
    statCurrentPeriod () {
      return this.$store.getters.statCurrentPeriod
    }
  }
}
</script>

<template lang="pug">
.stat
  .stat__content
    //------------------------------------------------
    //- expenses
    //------------------------------------------------
    .stat__item
      template(v-if="statCurrentPeriod.expenses.categoriesIds.length")
        .stat__chart(v-if="$store.state.ui.catsChart === 'visible'")
          PeriodCatsChart(type="expenses")

        .stat__cats(v-if="$store.state.ui.statItems === 'visible'")
          StatItem(
            v-for="categoryId in statCurrentPeriod.expenses.categoriesIds"
            :biggest="statCurrentPeriod.expenses.biggest"
            :category="$store.state.categories.items[categoryId]"
            :categoryId="categoryId"
            :currency="$store.state.currencies.base"
            :type="0"
            :key="categoryId"
            :total="statCurrentPeriod.categories[categoryId].expenses")
      .stat__empty(v-else) No expenses

    //------------------------------------------------
    //- incomes
    //------------------------------------------------
    .stat__item
      template(v-if="statCurrentPeriod.incomes.categoriesIds.length")
        .stat__chart(v-if="$store.state.ui.catsChart === 'visible'")
          PeriodCatsChart(type="incomes")

        .stat__cats(v-if="$store.state.ui.statItems === 'visible'")
          StatItem(
            v-for="categoryId in statCurrentPeriod.incomes.categoriesIds"
            :biggest="statCurrentPeriod.incomes.biggest"
            :category="$store.state.categories.items[categoryId]"
            :categoryId="categoryId"
            :currency="$store.state.currencies.base"
            :type="1"
            :key="categoryId"
            :total="statCurrentPeriod.categories[categoryId].incomes")
      .stat__empty(v-else) No incomes
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"

.stat
  position relative
  padding 0 $mb2

  &__content
    display flex
    justify-content space-between

  &__item
    flex 1
    max-width 400px
    padding-top 20px
    &:first-child
      align-self start
    &:last-child
      align-self start

  &__chart
    @media $media-laptop
      padding-bottom 12px

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
