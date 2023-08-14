<script>
// TODO: setup
export default {
  props: {
    type: { type: String, required: true },
  },

  data() {
    return {
      activeCategoryId: null,
      offset: 0,
    }
  },

  computed: {
    biggestAmount() {
      return this.$store.getters['stat/statCurrentPeriod'][this.type].biggest
    },
    categories() {
      return this.$store.state.categories.items
    },
    statCurrentPeriod() {
      return this.$store.getters['stat/statCurrentPeriod']
    },
  },
}
</script>

<template lang="pug">
.cats-chart(:class="className")
  .cats-chart__items.px-2.pb-2(v-if="statCurrentPeriod[type].categoriesIds.length > 0")
    StatCatsPeriodCatsChartItem(
      v-for="categoryId in statCurrentPeriod[type].categoriesIds"
      :key="`charts-${categoryId}`"
      :biggest="biggestAmount"
      :category="categories[categoryId]"
      :categoryId="categoryId"
      :total="statCurrentPeriod.categories[categoryId][type]"
    )
</template>

<style lang="stylus" scoped>
// TODO: style
.cats-chart
  &__items
    overflow hidden
    overflow-x auto
    display flex

    .mouse &
      scrollbar()
</style>
