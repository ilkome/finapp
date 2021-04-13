<script>
export default {
  name: 'SummaryAverage',

  computed: {
    statCurrentPeriod () {
      return this.$store.getters['stat/statCurrentPeriod']
    },

    statAverage () {
      return this.$store.getters['stat/statAverage']
    }
  }
}
</script>

<template lang="pug">
.summary
  .summary__name {{ $t('stat.title') }} {{ $t('for') }} {{ Object.keys($store.getters['stat/statByPeriods']).length }} {{ $t(`dates.${$store.state.filter.period}.simple`) }}
  .summary__content
    SummaryRowItem(
      v-if="statAverage.incomes !== 0"
      :amount="statAverage.incomes"
      :type="1"
      :name="$t('money.average.incomes')"
    )
    SummaryRowItem(
      v-if="statAverage.expenses !== 0"
      :amount="statAverage.expenses"
      :type="0"
      :name="$t('money.average.expenses')"
    )
    SummaryRowItem(
      v-if="statAverage.total !== 0"
      :amount="statAverage.total"
      :name="$t('money.averageTotal')"
    )
</template>

<style lang="stylus" scoped>
@import "~assets/stylus/variables"

.summary
  padding 0 $m7
  padding-bottom $m9

  &__name
    padding-bottom $m6
    color var(--c-font-2)
    font-size 18px
    font-weight 600
    white-space nowrap
    text-transform uppercase
    letter-spacing .5px
    font-secondary()

  &__content
    display flex
</style>
