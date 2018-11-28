<script>
import Amount from '@/components/amount/Amount'

export default {
  components: {
    Amount
  }
}
</script>

<template lang="pug">
.chart-popup(
  :style="{ left: $store.state.chart.hoveredPeriod.offset }"
)
  .chart-popup__item
    Amount(
      :value="$store.state.chart.hoveredPeriod.values.incomes"
      :currency="$store.state.currencies.base"
      :type="1"
    )
  .chart-popup__item
    Amount(
      :value="$store.state.chart.hoveredPeriod.values.expenses"
      :currency="$store.state.currencies.base"
      :type="0"
    )
  template(v-if="$store.state.chart.hoveredPeriod.values.incomes !== 0 && $store.state.chart.hoveredPeriod.values.expenses !== 0")
    .chart-popup__item
      Amount(
        :value="$store.state.chart.hoveredPeriod.values.incomes - $store.state.chart.hoveredPeriod.values.expenses"
        :currency="$store.state.currencies.base"
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
  background var(--c-bg-1)
  padding $m7 $m9
  border-radius $m4
  transform translate(-50%, calc(100% + 16px))

  &:after
    position absolute
    left 50%
    top -8px
    content ""
    border-left 8px solid transparent
    border-right 8px solid transparent
    border-bottom 8px solid var(--c-bg-1)
    transform translateX(-50%)

  &__item
    &:not(:last-child)
      margin-bottom $m4
</style>
