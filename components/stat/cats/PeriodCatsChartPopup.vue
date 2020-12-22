<script>
export default {
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
      if (this.$store.getters['stat/statCurrentPeriod'].categories[this.categoryId]) {
        return this.$store.getters['stat/statCurrentPeriod'].categories[this.categoryId][this.type]
      }
      return null
    },

    categoryName () {
      if (this.$store.state.categories.items[this.categoryId]) {
        return this.$store.state.categories.items[this.categoryId].name
      }
      return null
    }
  }
}
</script>

<template lang="pug">
.chart-popup(
  v-if="categoryId && amount && categoryName"
  :style="{ left: `${offset}px` }")

  .chart-popup__name {{ categoryName }}

  .chart-popup__item
    Amount(
      :value="amount"
      :currency="$store.state.currencies.base"
      :type="type === 'incomes' ? 1 : 0")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/fonts'
@import '~assets/stylus/variables/media'
@import '~assets/stylus/variables/scroll'

.chart-popup
  z-index 2
  position absolute
  bottom 0px
  display block
  padding $m6 $m8
  background var(--c-bg-6)
  border-radius $m4
  transform translate(-50%, calc(100% + 40px))
  white-space nowrap

  /.light-mode &
    background var(--c-bg-1)
    border 1px solid var(--c-bg-5)

  &:after
    position absolute
    top -8px
    left 50%
    transform translateX(-50%)
    content ''
    border-left 8px solid transparent
    border-right 8px solid transparent
    border-bottom 8px solid var(--c-bg-6)

    /.light-mode &
      border-bottom-color var(--c-bg-5)

  &__name
    padding-bottom $m5
    color var(--c-font-4)

  &__item
    &:not(:last-child)
      margin-bottom $m4
</style>
