<script>
import PeriodCatsChartItem from '@/components/stat/cats/PeriodCatsChartItem'
import PeriodCatsChartPopup from '@/components/stat/cats/PeriodCatsChartPopup'
import Slider from '@/components/slider/Slider'

export default {
  components: {
    PeriodCatsChartItem,
    PeriodCatsChartPopup,
    Slider
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
.cats-chart
  .cats-chart__items(
    v-if="stat[type].categoriesIds.length > 0")
    PeriodCatsChartItem(
      v-for="categoryId in stat[type].categoriesIds"
      :biggest="biggestAmount"
      :category="categories[categoryId]"
      :categoryId="categoryId"
      :key="`charts-${categoryId}`"
      :total="stat.categories[categoryId][type]"
      v-on:onActiveCategoryChange="handleActiveCategoryChange"
    )
  .cats-chart__popup(
    v-if="this.$store.state.ui.pc"
    v-show="activeCategoryId"
  )
    PeriodCatsChartPopup(
      :offset="offset"
      :categoryId="activeCategoryId"
      :type="type"
    )
</template>

<style lang="stylus">
.stat__item:first-child .cats-chart
  border-left 2px solid rgba(200, 30, 50, .3)

.stat__item:last-child .cats-chart
  border-left 2px solid rgba(44, 173, 34, .3)
</style>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/scrollbar"

.cats-chart
  position relative
  background var(--c-bg-3)

  &__items
    overflow hidden
    overflow-x auto
    scrollbar()
    display flex
    padding $m7

    @media $media-laptop
      padding $m8 $m8

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
