<script>
export default {
  props: {
    incomesAmount: {
      type: Number,
      default: 0
    },
    expensesAmount: {
      type: Number,
      default: 0
    }
  }
}
</script>

<template lang="pug">
.summary
  //- Incomes
  .summary__item._incomes
    .summary__item__title._incomes {{ $lang.money.incomes }}
    .summary__item__amount
      Amount(
        :center="true"
        :currency="$store.state.currencies.base"
        :type="1"
        :value="incomesAmount || 0"
        size="md"
      )

  //- Expenses
  .summary__item._expenses
    .summary__item__title._expenses {{ $lang.money.expenses }}
    .summary__item__amount
      Amount(
        :center="true"
        :currency="$store.state.currencies.base"
        :value="expensesAmount || 0"
        :type="0"
        size="md"
      )

  //- Total
  .summary__item._total
    template(v-if="(incomesAmount - expensesAmount) !== 0")
      .summary__item__title {{ $lang.money.total }}
      .summary__item__amount
        Amount(
          v-if="incomesAmount > 0 || expensesAmount > 0"
          :center="true"
          :currency="$store.state.currencies.base"
          :value="incomesAmount - expensesAmount"
          size="md"
        )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"

.summary
  display flex
  // padding $m6 0
  // background var(--c-bg-4)
  // border-radius $m5

  &__item
    position relative
    padding-right 32px
    display flex
    flex-flow column
    justify-content center

    &:after
      position absolute
      right 16px
      top 50%
      content ""
      width 1px
      height 32px
      background var(--c-bg-7)
      transform translateY(-50%)

    &:last-child
      padding-right 0
      &:after
        display none

    &__title
      padding-bottom $m5
      color var(--c-font-3)
      font-size 12px
</style>
