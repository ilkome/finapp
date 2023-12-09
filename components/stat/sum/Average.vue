<script>
export default {
  props: {
    amount: { type: Number, required: true },
    type: { type: Number, default: 3 },
    title: { type: String, required: true },
  },

  computed: {
    className() {
      return {
        '_expense': this.type === 0,
        '_income': this.type === 1,
        'pb-[2px]': true,
      }
    },
  },
}
</script>

<template lang="pug">
.summaryItem(:class="className")
  .summaryItem__title(class="pb-[2px]") {{ title }}
  .summaryItem__amount.text-item-base
    Amount(
      :amount="amount"
      :currencyCode="$store.state.currencies.base"
      :type="type"
      :colorize="type === 0 ? 'expense' : 'income'"
      :isShowBaseRate="false"
      :isShowSign="false"
    )
  .summaryItem__line
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'

.summaryItem
  position relative
  display flex
  flex-flow column

  &._expense
    color var(--c-expense-1)

  &._income
    color var(--c-income-1)

  &__title
    color var(--c-font-4)
    font-size 10px
    white-space nowrap

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
