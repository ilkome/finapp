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
    slot(name="expenses")

    StatCatsPeriodCatsChart(
      v-if="showCategoriesCharts"
      :key="categoryId"
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
    slot(name="incomes")

    StatCatsPeriodCatsChart(
      v-if="showCategoriesCharts"
      :key="categoryId"
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

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.block
  padding-bottom $m10

.title
  padding-bottom $m8
  font-h1()
  font-size 22px
  font-weight 600

  +media-laptop()
    font-size 28px

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
    grid-template-columns repeat(auto-fill, minmax(360px, 47%))

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
  padding-bottom $m5

.categoryIcon
  flex-grow 1
  display flex
  align-items center
  justify-content center
  margin-top -38px
  padding-bottom 12px
</style>
