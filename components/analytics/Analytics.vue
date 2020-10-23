<script>
export default {
  name: 'Analytics',

  props: {
    showCategoriesCharts: {
      type: Boolean,
      default: true
    },
    showInside: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
    }
  }
}
</script>

<template lang="pug">
.wrap

  .block
    PeriodCatsChart(
      v-if="showCategoriesCharts"
      type="expenses"
    )
    .columns
      .item(
        v-for="categoryId in statCurrentPeriod.expenses.categoriesIds"
        :key="categoryId"
      )
        .categoryWrap
          .categoryIcon
            Icon(
              :icon="$store.state.categories.items[categoryId].icon"
              :background="$store.state.categories.items[categoryId].color || $store.state.ui.defaultBgColor"
              :round="true"
              :big="true"
            )
          .modalBottom__header__title {{ $store.state.categories.items[categoryId].name }}

        .item__chart
          AnalyticsChart(:categoryId="categoryId")

        .item__inside
          StatItem(
            :biggest="statCurrentPeriod.expenses.biggest"
            :category="$store.state.categories.items[categoryId]"
            :categoryId="categoryId"
            :currency="$store.state.currencies.base"
            :key="categoryId"
            :type="0"
            :total="statCurrentPeriod.categories[categoryId].expenses"
          )

  .block
    PeriodCatsChart(
      v-if="showCategoriesCharts"
      type="incomes"
    )
    .columns
      .item(
        v-for="categoryId in statCurrentPeriod.incomes.categoriesIds"
        :key="categoryId"
      )
        .categoryWrap
          .categoryIcon
            Icon(
              :icon="$store.state.categories.items[categoryId].icon"
              :background="$store.state.categories.items[categoryId].color || $store.state.ui.defaultBgColor"
              :round="true"
              :big="true"
            )
          .modalBottom__header__title {{ $store.state.categories.items[categoryId].name }}

        .item__chart
          AnalyticsChart(:categoryId="categoryId")

        .item__inside
          StatItem(
            :biggest="statCurrentPeriod.expenses.biggest"
            :category="$store.state.categories.items[categoryId]"
            :categoryId="categoryId"
            :currency="$store.state.currencies.base"
            :key="categoryId"
            :type="1"
            :total="statCurrentPeriod.categories[categoryId].expenses"
          )
</template>

<style lang="stylus">
@import "~assets/stylus/variables"

.item
  .item__inside
    .statItem
    .statItem._active
      margin 0 (- $m6)
      margin-bottom (- $m6)
</style>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.block
  padding-bottom $m10

.wrap
  position relative

  +media-tablet()
    max-width 1100px
    padding 60px 60px

.columns
  display grid
  grid-template-columns repeat(1, 1fr)
  grid-column-gap $m9
  grid-row-gap 60px
  padding-top 60px
  padding-bottom $m9

  +media-tablet()
    grid-template-columns repeat(2, 1fr)

.item
  padding $m6
  color var(--c-font-1)
  background var(--c-bg-3)
  border-radius $m6

  &__name
    min-width 100px
    padding $m7
    padding-bottom $m8
    color var(--c-font-2)
    font-size 18px
    fontFamilyNunito()

  &__chart
    flex-grow 1

  &__inside
    padding-top $m6

.categoryWrap
  flex-grow 1
  display flex
  align-items center
  justify-content center
  flex-flow column
  margin-top -38px
  padding-bottom $m5

.categoryIcon
  flex-grow 1
  display flex
  align-items center
  justify-content center
  padding-bottom 12px
</style>
