<script>
export default {
  computed: {
    stat () {
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
  .summary__item._incomes(@click="$store.dispatch('ui/setActiveTabStat', 'incomes')")
    template(v-if="statAverage.incomes > 0 || period === 'all'")
      .summary__item__title._incomes {{ $t('money.incomes') }}
      .summary__item__amount
        Amount(
          :center="true"
          :currency="$store.state.currencies.base"
          :type="1"
          :value="stat.incomes.total"
        )
    template(v-else) .

  .summary__item._total(@click="$store.dispatch('ui/setActiveTabStat', 'stat')")
    template(v-if="statAverage.total !== 0")
      template(v-if="stat.incomes.total > 0 || stat.expenses.total > 0")
        .summary__item__title {{ $t('money.total') }}
        .summary__item__amount
          Amount(
            :center="true"
            :currency="$store.state.currencies.base"
            :value="stat.incomes.total - stat.expenses.total"
          )
    template(v-else) .

  .summary__item._expenses(@click="$store.dispatch('ui/setActiveTabStat', 'expenses')")
    template(v-if="statAverage.expenses > 0 || period === 'all'")
      .summary__item__title._expenses {{ $t('money.expenses') }}
      .summary__item__amount
        Amount(
          :center="true"
          :currency="$store.state.currencies.base"
          :value="stat.expenses.total"
          :type="0"
        )
    template(v-else) .
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables/margins"

.summary
  display flex
  margin $m6
  margin-bottom 0
  padding $m6 0
  background var(--c-bg-4)
  // border-bottom 1px solid var(--c-bg-1)
  border-radius $m5

  &__item
    flex 1
    text-align center
    display flex
    flex-flow column
    align-items center
    justify-content center

    &:first-child
      align-items flex-start
      padding-left $m7

    &:last-child
      align-items flex-end
      padding-right $m7

    &__title
      padding-bottom $m5
      color var(--c-font-4)
</style>
