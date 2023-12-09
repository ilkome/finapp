<script lang="ts">
import useFilter from '~/components/filter/useFilter'

// TODO: setup
export default defineComponent({
  props: {
    biggest: { type: Number, required: true },
    category: { type: Object, required: true },
    categoryId: { type: String, required: true },
    total: { type: Number, required: true },
  },

  setup() {
    const { setFilterCatsId } = useFilter()
    return {
      setFilterCatsId,
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
.statCatsItem.swiper-no-swiping.active.hocus_bg-item-main-hover(
  @click="setFilterCatsId(categoryId)"
)
  .statCatsItem__graph.bg-item-main-active
    .statCatsItem__graph__in(:style="styles")
      .statCatsItem__graph__amount {{ amount }}

  .statCatsItem__icon(:style="{ background: category.color }")
    div(:class="category.icon")
</template>

<style lang="stylus" scoped>
// TODO: styles
.statCatsItem
  cursor pointer
  margin-top 16px
  margin-right 8px
  border-radius $m4
  +media-hover()
    padding 8px
    margin 8px 0 -8px -8px

  &__graph
    position relative
    width 28px
    height 80px
    margin 0 auto
    margin-bottom -3px
    border-radius $m4

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
      border-radius $m4 $m4 0 0

  &__icon
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
