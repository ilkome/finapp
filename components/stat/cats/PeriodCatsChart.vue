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
      if (offset) { this.offset = offset }
      categoryId
        ? this.activeCategoryId = categoryId
        : this.activeCategoryId = null
    }
  }
}
</script>

<template lang="pug">
.cats-chart(:class="className")
  .cats-chart__items(v-if="statCurrentPeriod[type].categoriesIds.length > 0")
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
    v-if="$store.state.ui.pc"
    v-show="activeCategoryId"
  )

    StatCatsPeriodCatsChartPopup(
      :offset="offset"
      :categoryId="activeCategoryId"
      :type="type"
    )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/animations"
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/scroll"

.cats-chart
  position relative
  width 100%

  @media $media-laptop
    opacity .7
    anim-all(100)

  &:hover
    @media $media-laptop
      opacity 1

  &._incomes
    @media $media-laptop
      border-bottom 2px solid rgba(44, 173, 34, .5)

  &._expenses
    @media $media-laptop
      border-bottom 2px solid rgba(200, 30, 50, .3)

  &__items
    overflow hidden
    overflow-x auto
    scrollbar()
    display flex
    padding $m7 $m6

    @media $media-laptop
      padding 10px 10px

    &:after
      content ""
      min-width $m7

      @media $media-laptop
        min-width $m9

  &__popup
    z-index 5
    position absolute
    left 0
    bottom $m9
</style>
