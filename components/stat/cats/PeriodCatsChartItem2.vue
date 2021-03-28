<script>
export default {
  name: 'StatCatsPeriodCatsChartItem2',

  props: {
    category: {
      type: Object,
      required: true
    },
    categoryId: {
      type: String,
      required: true
    },
    total: {
      type: Number,
      required: true
    },
    biggest: {
      type: Number,
      required: true
    }
  },

  computed: {
    styles () {
      return {
        width: `${Math.abs(this.total) / Math.abs(this.biggest) * 100}%`,
        background: this.category.color
      }
    },
    amount () {
      if (this.total >= 1000000) {
        return (this.total / 1000000).toFixed(2) + 'm'
      }
      else if (this.total >= 10000) {
        return (this.total / 1000).toFixed() + 'k'
      }
      else if (this.total > 999) {
        return (this.total / 1000).toFixed(1) + 'k'
      }

      return this.total.toFixed()
    }
  },

  methods: {
    handleMouseEnter (e) {
      if (this.$store.state.ui.pc) {
        const parent = e.target.parentNode
        const parentScrollLeft = parent.scrollLeft
        const targetOffset = e.target.offsetLeft
        const targetWidth = e.target.clientWidth
        const offset = targetOffset + (targetWidth / 2) - parentScrollLeft
        this.$emit('onActiveCategoryChange', { offset, categoryId: this.categoryId })
      }
    },

    handleMouseLeave (e) {
      if (this.$store.state.ui.pc) {
        this.$emit('onActiveCategoryChange', { categoryId: null })
      }
    }
  }
}
</script>

<template lang="pug">
.statCatsItem.statCatsItem.swiper-no-swiping(
  :style="styles"
)
  .statCatsItem__text(v-if="total / biggest * 100 > 20") {{ category.name }}
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/media"

.statCatsItem
  height 12px

  &__text
  &__count
    display none
</style>
