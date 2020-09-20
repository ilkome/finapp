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
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.stat
  position relative
  padding 0 60px

  &__content
    display grid
    grid-template-columns repeat(2, 1fr)
    grid-column-gap $m10

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
