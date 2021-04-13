<script>
export default {
  computed: {
    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
    },

    statAverage () {
      return this.$store.getters['stat/statAverage']
    },

    period () {
      return this.$store.state.filter.period
    }
  }
}
</script>

<template lang="pug">
.summary
  .summary__wrap
    //- expenses
    //------------------------------------------------
    .summary__item(:class="{ _expenses: statAverage.expenses > 0 || period === 'all' }")
      template(v-if="statAverage.expenses > 0 || period === 'all'")
        .summary__row
          .summary__title._expenses {{ $t('money.expenses') }}
          .summary__amount
            Amount(
              :big="true"
              :currency="$store.state.currencies.base"
              :value="statCurrentPeriod.expenses.total"
              :type="0")

        .summary__row(v-if="period !== 'all' && statAverage.expenses > 0")
          .summary__average
            .summary__average__icon: .mdi.mdi-chart-timeline
            .summary__average__title {{ $t('money.average.base') }}
          .summary__amount._average
            Amount(
              :currency="$store.state.currencies.base"
              :value="statAverage.expenses")

    //- total
    //------------------------------------------------
    .summary__item(:class="{ _total: statAverage.total !== 0 || period === 'all' }")
      template(v-if="statAverage.total !== 0 || period === 'all'")
        .summary__row
          .summary__title {{ $t('money.total') }}
          .summary__amount
            Amount(
              :big="true"
              :currency="$store.state.currencies.base"
              :value="statCurrentPeriod.incomes.total - statCurrentPeriod.expenses.total")

        template(v-if="period !== 'all' && statAverage.total !== 0")
          .summary__row
            .summary__average
              .summary__average__icon: .mdi.mdi-chart-timeline
              .summary__average__title {{ $t('money.average.base') }}
            .summary__amount._average
              Amount(
                :currency="$store.state.currencies.base"
                :value="statAverage.total")

    //- incomes
    //------------------------------------------------
    .summary__item(:class="{ _incomes: statAverage.incomes > 0 || period === 'all' }")
      template(v-if="statAverage.incomes > 0 || period === 'all'")
        .summary__row
          .summary__title._incomes {{ $t('money.incomes') }}
          .summary__amount
            Amount(
              :big="true"
              :currency="$store.state.currencies.base"
              :value="statCurrentPeriod.incomes.total"
              :type="1")

        template(v-if="period !== 'all' && statAverage.incomes !== 0")
          .summary__row
            .summary__average
              .summary__average__icon: .mdi.mdi-chart-timeline
              .summary__average__title {{ $t('money.average.base') }}
            .summary__amount._average
              Amount(
                :currency="$store.state.currencies.base"
                :value="statAverage.incomes")
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/fonts'
@import '~assets/stylus/variables/media'

.summary
  overflow hidden
  background var(--c-bg-3)
  border-top 1px solid var(--c-bg-2)
  border-bottom 1px solid var(--c-bg-2)

  &__wrap
    display grid
    flex-flow row
    grid-template-columns repeat(auto-fill, minmax(200px, 1fr))
    grid-column-gap $m9
    grid-row-gap $m9
    max-width 1100px
    padding 20px 60px

  &__item
    flex-grow 0
    display flex
    flex-flow column
    justify-content center
    margin $m5 $m7
    padding $m3 $m9
    padding-right 0

    @media $media-laptop
      padding $m3 $m8
      padding-right 0

    &._expenses
      border-left 2px solid rgba(200, 30, 50, .3)

    &._total
      align-self center
      border-left 2px solid var(--c-bg-6)

    &._incomes
      align-self end
      border-left 2px solid rgba(44, 173, 34, .5)

  &__row
    flex-grow 0
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
    opacity .7
    display flex

    &__icon
      margin-right $m5
      font-size 15px

    &__title
      padding-right $m8
      font-header-4()
      font-size 16px
</style>
