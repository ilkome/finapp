<script>
export default {
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
        height: `${Math.abs(this.total) / Math.abs(this.biggest) * 100}%`,
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
.statCatsItem.swiper-no-swiping(
  @click="() => $store.dispatch('filter/handleSetFilterCategory', categoryId)"
  @mouseenter="handleMouseEnter"
  @mouseleave="handleMouseLeave"
)
  .statCatsItem__graph
    .statCatsItem__graph__in(:style="styles")
      .statCatsItem__graph__amount {{ amount }}

  .statCatsItem__icon(:style="{ background: category.color }")
    div(:class="category.icon")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'

.statCatsItem
  cursor pointer
  margin-top 12px
  margin-right 10px
  background var(--c-bg-5)
  border-radius $m3

  &:hover
    @media $media-laptop
      @media (hover hover)
        margin -20px 0px -20px -10px
        padding 32px 10px 20px 10px
        background var(--c-bg-6)

        /.light-mode &
          background var(--c-bg-1)

  &__graph
    position relative
    width 28px
    height 80px
    margin 0 auto
    margin-bottom -3px
    border-radius 3px

    &__amount
      position absolute
      top -14px
      left 50%
      width 100%
      color var(--c-font-2)
      font-size 10px
      text-align center
      transform translateX(-50%)

    &__in
      position absolute
      left 0
      bottom 0px
      width 100%
      min-height 1px
      border-radius 3px 3px 0 0

  &__icon
    display none
    display flex
    align-items center
    justify-content center
    width 28px
    height 28px
    margin 0 auto
    color var(--c-font-1)
    font-size 16px
    border-radius 3px
</style>
