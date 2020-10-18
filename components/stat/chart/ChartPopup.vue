<script>
export default {
}
</script>

<template lang="pug">
.chart-popup(:style="{ left: $store.state.chart.hoveredPeriod.offset }")
  SummaryRow2(
    :incomesAmount="$store.state.chart.hoveredPeriod.values.incomes"
    :expensesAmount="$store.state.chart.hoveredPeriod.values.expenses"
  )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"
@import "~assets/stylus/variables/fonts"
@import "~assets/stylus/variables/media"
@import "~assets/stylus/variables/scroll"

.chart-popup
  display block
  position absolute
  bottom 0px
  background var(--c-bg-2)
  padding $m7 $m7
  border-radius $m4
  transform translate(-50%, calc(100% + 16px))

  &:after
    position absolute
    left 50%
    top -8px
    content ""
    border-left 8px solid transparent
    border-right 8px solid transparent
    border-bottom 8px solid var(--c-bg-2)
    transform translateX(-50%)

  &__item
    &:not(:last-child)
      margin-bottom $m4
</style>
