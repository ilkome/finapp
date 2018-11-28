<script>
import Amount from '@/components/amount/Amount'
import Icon from '@/components/icon/Icon'

export default {
  components: {
    Amount,
    Icon
  },

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
      } else if (this.total >= 10000) {
        return (this.total / 1000).toFixed() + 'k'
      } else if (this.total > 999) {
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
.statCatsItem(
  @click="() => $store.dispatch('handleSetFilterCategory', categoryId)"
  @mouseenter="handleMouseEnter"
  @mouseleave="handleMouseLeave")
  .statCatsItem__graph
    .statCatsItem__graph__in(:style="styles")
      .statCatsItem__graph__amount {{ amount }}

  .statCatsItem__icon(:style="{ background: category.color }")
    div(:class="category.icon")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"

.statCatsItem
  padding-top $m6
  padding-right $m4

  &__graph
    position relative
    width 28px
    margin 0 auto
    height 80px

    &__amount
      position absolute
      left 50%
      top -14px
      transform translateX(-50%)
      width 100%
      text-align center
      font-size 10px
      color var(--c-font-2)

    &__in
      min-height 1px
      position absolute
      left 0
      bottom 0px
      width 100%

  &__icon
    display none
    transform scale(0.8)
    display flex
    align-items center
    justify-content center
    font-size 18px
    width 32px
    height 32px
    margin 0 auto
    margin-top $m5
    margin-bottom (- $m5)
    color var(--c-font-1)
    border-radius 50%
</style>
