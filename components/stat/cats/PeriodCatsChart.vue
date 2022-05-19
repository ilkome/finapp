<script>
export default {
  props: {
    type: {
      type: String,
      required: true,
      validator(value) {
        return value === 'income' || value === 'expense'
      },
    },
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

  methods: {
    handleActiveCategoryChange({ categoryId, offset }) {
      if (offset)
        this.offset = offset
      categoryId
        ? this.activeCategoryId = categoryId
        : this.activeCategoryId = null
    },
  },
}
</script>

<template lang="pug">
.cats-chart(:class="className")
  .cats-chart__items.px-2.pb-2(v-if="statCurrentPeriod[type].categoriesIds.length > 0")
    StatCatsPeriodCatsChartItem(
      v-for="categoryId in statCurrentPeriod[type].categoriesIds"
      :biggest="biggestAmount"
      :category="categories[categoryId]"
      :categoryId="categoryId"
      :key="`charts-${categoryId}`"
      :total="statCurrentPeriod.categories[categoryId][type]"
      @onActiveCategoryChange="handleActiveCategoryChange"
    )
</template>

<style lang="stylus" scoped>
.cats-chart
  &__items
    overflow hidden
    overflow-x auto
    display flex

    .isNotTouchDevice &
      scrollbar()
</style>
