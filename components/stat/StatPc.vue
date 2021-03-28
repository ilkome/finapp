<script>
export default {
  computed: {
    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
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
        .stat__chart(v-if="$store.state.ui.catsChart === 'visible' && statCurrentPeriod.expenses.categoriesIds.length > 1")
          StatCatsPeriodCatsChart(type="expenses")

        .stat__pie(v-if="$store.state.ui.catsChartPie === 'visible' && statCurrentPeriod.expenses.categoriesIds.length > 1")
          StatChartPie(amountType="expenses")

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
        .stat__chart(v-if="$store.state.ui.catsChart === 'visible' && statCurrentPeriod.incomes.categoriesIds.length > 1")
          StatCatsPeriodCatsChart(type="incomes")

        .stat__pie(v-if="$store.state.ui.catsChartPie === 'visible' && statCurrentPeriod.incomes.categoriesIds.length > 1")
          StatChartPie(amountType="incomes")

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
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

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
</style>
