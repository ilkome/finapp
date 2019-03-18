<script>
import PeriodCatsChartItem from '@/components/stat/cats/PeriodCatsChartItem'
import PeriodCatsChartPopup from '@/components/stat/cats/PeriodCatsChartPopup'

export default {
  components: {
    PeriodCatsChartItem,
    PeriodCatsChartPopup
  },

  props: {
    type: {
      type: String,
      required: true
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
        _mobile: this.$store.state.ui.mobile,
        _pc: this.$store.state.ui.pc,
        _incomes: this.type === 'incomes',
        _expenses: this.type === 'expenses'
      }
    },
    biggestAmount () {
      return this.$store.getters.stat[this.type].biggest
    },
    categories () {
      return this.$store.state.categories.items
    },
    stat () {
      return this.$store.getters.stat
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
.cats-chart(:class="className")
  .cats-chart__items(
    v-if="stat[type].categoriesIds.length > 0")
    PeriodCatsChartItem(
      v-for="categoryId in stat[type].categoriesIds"
      :biggest="biggestAmount"
      :category="categories[categoryId]"
      :categoryId="categoryId"
      :key="`charts-${categoryId}`"
      :total="stat.categories[categoryId][type]"
      v-on:onActiveCategoryChange="handleActiveCategoryChange")

  .cats-chart__popup(
    v-if="this.$store.state.ui.pc"
    v-show="activeCategoryId")
    PeriodCatsChartPopup(
      :offset="offset"
      :categoryId="activeCategoryId"
      :type="type")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/animations"
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/scrollbar"

.cats-chart
  position relative
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
    padding $m7

    @media $media-laptop
      padding 10px 10px

    &:after
      content ""
      min-width $m7

      @media $media-laptop
        min-width $m9

  &__popup
    position absolute
    left 0
    bottom $m9
</style>
