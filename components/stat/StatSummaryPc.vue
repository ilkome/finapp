<script>
import { computed, useContext } from '@nuxtjs/composition-api'

export default {
  setup () {
    const { store } = useContext()

    const statCurrentPeriod = computed(() => store.getters['stat/statCurrentPeriod'])
    const statAverage = computed(() => store.getters['stat/statAverage'])

    return {
      statCurrentPeriod,
      statAverage
    }
  }
}
</script>

<template lang="pug">
.baseBox(v-if="statAverage.incomes !== 0 && statAverage.expenses !== 0 && $store.state.filter.period !== 'all'")
  .baseBox__title {{ $t('money.total') }}
  .boxSummary2
    .boxSummary2__item
      Amount(
        :currency="$store.state.currencies.base"
        :type="(statCurrentPeriod.incomes.total - statCurrentPeriod.expenses.total) > 0 ? 1 : 0"
        :value="statCurrentPeriod.incomes.total - statCurrentPeriod.expenses.total"
        size="xl"
        vertical="left"
      )
    StatSummaryRowItemView(
      :type="(statAverage.incomes - statAverage.expenses) > 0 ? 1 : 0"
      :amount="statAverage.incomes - statAverage.expenses"
      :title="$t('money.averageTotal')"
    )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.baseBox
  overflow hidden
  padding $m5 $m7
  background var(--c-bg-3)
  border-top 1px solid var(--c-bg-2)

  +media(700px)
    padding $m5 54px

  &__title
    z-index 9
    display flex
    align-items center
    padding $m6 $m6
    color var(--c-font-3)
    font-size 10px
    letter-spacing 1px
    font-weight 500
    text-transform uppercase

// ------------------------------------
.boxSummary2
  z-index 9
  display flex
  align-items center
  justify-content flex-start
  margin-bottom $m3
  padding 0 $m5
  padding-bottom $m5

  &__item
    padding-right $m9
</style>
