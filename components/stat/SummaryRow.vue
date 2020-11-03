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
  },

  computed: {
    statAverage () {
      return this.$store.getters['stat/statAverage']
    }
  }
}
</script>

<template lang="pug">
.summary
  //- Incomes
  .summary__item._incomes(v-if="statAverage.incomes !== 0")
    .summary__item__title._incomes {{ $t('money.incomes') }}
    .summary__item__amount
      Amount(
        :currency="$store.state.currencies.base"
        :type="1"
        :value="incomesAmount || 0"
        size="md"
        vertical="left"
      )

  //- Expenses
  .summary__item._expenses(v-if="statAverage.expenses !== 0")
    .summary__item__title._expenses {{ $t('money.expenses') }}
    .summary__item__amount
      Amount(
        :currency="$store.state.currencies.base"
        :type="0"
        :value="expensesAmount || 0"
        size="md"
        vertical="left"
      )

  //- Total
  .summary__item._total(v-if="statAverage.total !== 0")
    template(v-if="(incomesAmount - expensesAmount) !== 0")
      .summary__item__title {{ $t('money.total') }}
      .summary__item__amount
        Amount(
          :center="true"
          :currency="$store.state.currencies.base"
          :value="incomesAmount - expensesAmount"
          size="md"
          vertical="left"
        )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"

.summary
  display flex

  &__item
    flex 1 0 0
    position relative
    display flex
    justify-content center
    flex-flow column
    // padding-right 32px

    // &:after
    //   position absolute
    //   top 50%
    //   right 16px
    //   content ""
    //   width 1px
    //   height 32px
    //   background var(--c-bg-7)
    //   transform translateY(-50%)

    // &:last-child
    //   padding-right 0
    //   &:after
    //     display none

    &__title
      padding-bottom $m5
      color var(--c-font-3)
      font-size 12px
</style>
