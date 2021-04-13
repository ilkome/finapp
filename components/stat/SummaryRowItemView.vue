<script>
export default {
  name: 'StatSummaryRowItemView',

  props: {
    amount: {
      type: Number,
      required: true
    },
    type: {
      type: Number,
      default: 3
    },
    title: {
      type: String,
      required: true
    }
  },

  computed: {
    className () {
      return {
        _expenses: this.type === 0,
        _incomes: this.type === 1
      }
    }
  }
}
</script>

<template lang="pug">
.summaryItem(:class="className")
  .summaryItem__title {{ title }}
  .summaryItem__amount
    Amount(
      :currency="$store.state.currencies.base"
      :type="type"
      :value="amount"
      size="md"
      vertical="left"
    )
  .summaryItem__line
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'

.summaryItem
  position relative
  display flex
  flex-flow column
  margin-right $m8
  padding-right $m8

  &._expenses
    color var(--c-expenses-1)

  &._incomes
    color var(--c-incomes-1)

  &__title
    padding-bottom $m4
    color var(--c-font-4)
    font-size 10px

  &__line
    position absolute
    top 50%
    right 0
    width 1px
    height 20px
    background var(--c-bg-6)
    transform translateY(-50%)

    ~/:last-child &
      display none
</style>
