<script>
export default {
  props: {
    type: {
      type: String,
      required: true,
      validator (value) {
        return value === 'incomes' || value === 'expenses'
      }
    }
  },

  data () {
    return {
      activeCategoryId: null,
      offset: 0
    }
  },

  computed: {
    className () {
      return {
        _incomes: this.type === 'incomes',
        _expenses: this.type === 'expenses'
      }
    },
    biggestAmount () {
      return this.$store.getters['stat/statCurrentPeriod'][this.type].biggest
    },
    categories () {
      return this.$store.state.categories.items
    },
    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
    }
  },

  methods: {
    handleActiveCategoryChange ({ categoryId, offset }) {
      if (offset) this.offset = offset
      categoryId
        ? this.activeCategoryId = categoryId
        : this.activeCategoryId = null
    }
  }
}
</script>

<template lang="pug">
div(:class="className")
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

  .cats-chart__popup(
    v-show="activeCategoryId"
  )

    StatCatsPeriodCatsChartPopup(
      :offset="offset"
      :categoryId="activeCategoryId"
      :type="type"
    )
</template>

<style lang="stylus" scoped>
.cats-chart
  &._incomes
    border-bottom 2px solid rgba(44, 173, 34, .5)

  &._expenses
    border-bottom 2px solid rgba(200, 30, 50, .3)

  &__items
    overflow hidden
    overflow-x auto
    display flex

    .isNotTouchDevice &
      scrollbar()

  &__popup
    z-index 5
    position absolute
    left 0
    bottom $m9
</style>
