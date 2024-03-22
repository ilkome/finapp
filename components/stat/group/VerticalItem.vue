<script lang="ts">
import { useFilter } from '~/components/filter/useFilter'

// TODO: setup
export default defineComponent({
  props: {
    biggest: { type: Number, required: true },
    category: { type: Object, required: true },
    categoryId: { type: String, required: true },
    total: { type: Number, required: true },
  },

  setup() {
    const { setCategoryId } = useFilter()
    return {
      setCategoryId,
    }
  },

  computed: {
    styles() {
      return {
        height: `${Math.abs(this.total) / Math.abs(this.biggest) * 100}%`,
        background: this.category.color,
      }
    },
    amount() {
      if (this.total >= 1000000)
        return `${(this.total / 1000000).toFixed(2)}m`
      else if (this.total >= 10000)
        return `${(this.total / 1000).toFixed()}k`
      else if (this.total > 999)
        return `${(this.total / 1000).toFixed(1)}k`

      return this.total.toFixed()
    },
  },
})
</script>

<template lang="pug">
.statCatsItem.swiper-no-swiping.active.hocus_bg-item-5.mx-2.hocus_mx-0.hocus_p-2.rounded-lg(
  @click="setCategoryId(categoryId)"
)
  .statCatsItem__graph._bg-item-3
    .statCatsItem__graph__in(:style="styles")
      .statCatsItem__graph__amount {{ amount }}

  .statCatsItem__icon.pt-2(:style="{ color: category.color }")
    .text-xl(:class="category.icon")
</template>

<style lang="stylus" scoped>
@import "../assets/stylus/variables"

// TODO: styles
.statCatsItem
  cursor pointer
  margin-top 16px

  +media-hover()
    margin 8px 0 -8px 0

  &__graph
    position relative
    width 18px
    height 80px
    margin 0 auto
    margin-bottom -3px
    border-radius 4px

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
      bottom 0
      width 100%
      min-height 1px
      border-radius 4px 4px 0 0

  &__icon
    display flex
    align-items center
    justify-content center
    width 28px
    height 28px
</style>
