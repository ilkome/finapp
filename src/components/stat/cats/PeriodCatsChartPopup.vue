<script>
import Amount from '@/components/amount/Amount'

export default {
  components: {
    Amount
  },

  props: {
    categoryId: {
      type: String,
      default: null
    },
    offset: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },

  computed: {
    amount () {
      return this.$store.getters.stat.categories[this.categoryId][this.type]
    },
    categoryName () {
      return this.$store.state.categories.items[this.categoryId].name
    }
  }
}
</script>

<template lang="pug">
.chart-popup(
  v-if="categoryId"
  :style="{ left: `${offset}px` }"
)
  .chart-popup__name {{ categoryName }}
  .chart-popup__item
    Amount(
      :value="amount"
      :currency="$store.state.currencies.base"
      :type="type === 'incomes' ? 1 : 0"
    )
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/media"
@import "~@/stylus/variables/scrollbar"

.chart-popup
  z-index 2
  display block
  position absolute
  bottom 0px
  padding $m6 $m8
  white-space nowrap
  background var(--c-bg-6)
  border-radius $m4
  transform translate(-50%, calc(100% + 26px))

  &:after
    position absolute
    left 50%
    top -8px
    content ""
    border-left 8px solid transparent
    border-right 8px solid transparent
    border-bottom 8px solid var(--c-bg-6)
    transform translateX(-50%)

  &__name
    padding-bottom $m5
    color var(--c-font-4)

  &__item
    &:not(:last-child)
      margin-bottom $m4
</style>
