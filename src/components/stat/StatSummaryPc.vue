<script>
import Amount from '@/components/amount/Amount'

export default {
  components: {
    Amount
  },

  computed: {
    stat () {
      return this.$store.getters.stat
    },
    statAverage () {
      return this.$store.getters.statAverage
    },
    period () {
      return this.$store.state.filter.period
    }
  }
}
</script>

<template lang="pug">
.summary
  //- expenses
  //------------------------------------------------
  .summary__item(:class="{ _expenses: statAverage.expenses > 0 || period === 'all' }")
    template(v-if="statAverage.expenses > 0 || period === 'all'")
      .summary__row
        .summary__title._expenses Expenses
        .summary__amount
          Amount(
            :big="true"
            :currency="$store.state.currencies.base"
            :value="stat.expenses.total.expenses"
            :type="0")

      .summary__row(v-if="period !== 'all' && statAverage.expenses > 0")
        .summary__average
          .summary__average__icon: .mdi.mdi-chart-timeline
          .summary__average__title Average
        .summary__amount._average
          Amount(
            :currency="$store.state.currencies.base"
            :value="statAverage.expenses")

  //- total
  //------------------------------------------------
  .summary__item(:class="{ _total: statAverage.total !== 0 || period === 'all' }")
    template(v-if="statAverage.total !== 0 || period === 'all'")
      .summary__row
        .summary__title Total
        .summary__amount
          Amount(
            :big="true"
            :currency="$store.state.currencies.base"
            :value="stat.incomes.total.incomes - stat.expenses.total.expenses")

      template(v-if="period !== 'all' && statAverage.total !== 0")
        .summary__row
          .summary__average
            .summary__average__icon: .mdi.mdi-chart-timeline
            .summary__average__title Average
          .summary__amount._average
            Amount(
              :currency="$store.state.currencies.base"
              :value="statAverage.total")

  //- incomes
  //------------------------------------------------
  .summary__item(:class="{ _incomes: statAverage.incomes > 0 || period === 'all' }")
    template(v-if="statAverage.incomes > 0 || period === 'all'")
      .summary__row
        .summary__title._incomes Incomes
        .summary__amount
          Amount(
            :big="true"
            :currency="$store.state.currencies.base"
            :value="stat.incomes.total.incomes"
            :type="1")

      template(v-if="period !== 'all' && statAverage.incomes !== 0")
        .summary__row
          .summary__average
            .summary__average__icon: .mdi.mdi-chart-timeline
            .summary__average__title Average
          .summary__amount._average
            Amount(
              :currency="$store.state.currencies.base"
              :value="statAverage.incomes")
</template>

<style lang="stylus" scoped>
@import "~@/stylus/variables/margins"
@import "~@/stylus/variables/fonts"
@import "~@/stylus/variables/media"

.summary
  overflow hidden
  display flex
  flex-flow column
  padding $m9 0

  @media $media-pc
    flex-flow row
    align-items stretch
    justify-content space-between
    padding 0

  &__item
    flex 1
    display flex
    flex-flow column
    justify-content center
    margin 0 $m7
    padding $m3 $m8
    padding-right 0
    @media $media-phone
      border-bottom 1px solid var(--c-bg-5)

    @media $media-pc
      max-width 280px
      margin 0

    &._expenses
      border-left 2px solid rgba(200, 30, 50, .3)
      @media $media-phone
        order 1

    &._incomes
      border-left 2px solid rgba(44, 173, 34, .5)
      @media $media-phone
        order 2

    &._total
      border-left 2px solid var(--c-bg-5)
      @media $media-phone
        order 3

  &__row
    display flex
    align-items center
    justify-content space-between
    padding-bottom $m6
    &:last-child
      padding-bottom 0

  &__title
    font-header-4()
    padding-right $m8
    &._incomes
      color var(--c-incomes-1)
    &._expenses
      color var(--c-expenses-1)

  &__amount
    &._average
      opacity .7
      .amount
        font-size 15px

  &__average
    display flex
    opacity .7

    &__icon
      font-size 15px
      margin-right $m5

    &__title
      font-header-4()
      font-size 16px
      padding-right $m8
</style>
