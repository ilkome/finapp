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
    },

    activeTabViewName () {
      return this.$store.state.ui.activeTabViewName
    }
  }
}
</script>

<template lang="pug">
.summary
  //- Incomes
  .summary__item._incomes(
    v-if="statAverage.incomes !== 0"
  )
    .summary__item__title._incomes {{ $t('money.incomes') }}
    .summary__item__amount
      Amount(
        :currency="$store.state.currencies.base"
        :type="1"
        :value="incomesAmount || 0"
        size="md"
        vertical="left"
      )

  //- Total
  .summary__item._total(v-if="statAverage.incomes !== 0 && (activeTabViewName === 'incomes' || activeTabViewName === 'chart2' || activeTabViewName === 'history')")
    .summary__item__title {{ $t('money.averageIncomes') }}
    .summary__item__amount
      Amount(
        :center="true"
        :currency="$store.state.currencies.base"
        :type="1"
        :value="statAverage.incomes"
        size="md"
        vertical="left"
      )

  //- Expenses
  .summary__item._expenses(
    v-if="statAverage.expenses !== 0"
  )
    .summary__item__title._expenses {{ $t('money.expenses') }}
    .summary__item__amount
      Amount(
        :currency="$store.state.currencies.base"
        :type="0"
        :value="expensesAmount || 0"
        size="md"
        vertical="left"
      )

  .summary__item._total(v-if="statAverage.expenses !== 0 && (activeTabViewName === 'expenses' || activeTabViewName === 'chart2' || activeTabViewName === 'history2')")
    .summary__item__title {{ $t('money.averageExpenses') }}
    .summary__item__amount
      Amount(
        :center="true"
        :currency="$store.state.currencies.base"
        :type="0"
        :value="statAverage.expenses"
        size="md"
        vertical="left"
      )

  //- Total
  .summary__item._total(v-if="statAverage.total !== 0 && (incomesAmount - expensesAmount) !== 0 && (activeTabViewName === 'chart' || activeTabViewName === 'history2')")
    .summary__item__title {{ $t('money.total') }}
    .summary__item__amount
      Amount(
        :center="true"
        :currency="$store.state.currencies.base"
        :value="incomesAmount - expensesAmount"
        size="md"
        vertical="left"
      )

  //- pre {{ statAverage }}
  //- pre {{ incomesAmount - expensesAmount }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'

.summary
  display flex
  flex-grow 1

  &__item
    flex 1 0 0
    position relative
    display flex
    align-items center
    justify-content center
    flex-flow column
    padding 0 $m6

    &__title
      padding-bottom $m4
      color var(--c-font-4)
      font-size 10px
</style>
