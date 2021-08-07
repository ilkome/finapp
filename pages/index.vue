<script>
export default {
  name: 'IndexPage',

  head () {
    return {
      title: this.$t('stat.title')
    }
  }
}
</script>

<template lang="pug">
.h100
  LazyStatDashboard(v-if="$store.getters['trns/hasTrns']")
  LazyStatNoStatActions(v-if="!$store.getters['trns/hasTrns']")

  //- Analytics
  //-----------------------------
  //- template(v-if="activeTabViewName === 'analytics'")
  //-   .pageAnalytics
  //-     Analytics
  //-       template(#incomes)
  //-         .boxTitle {{ $t('money.incomes') }}

  //-         .boxSummary2
  //-           .boxSummary2__item
  //-             Amount(
  //-               :currency="$store.state.currencies.base"
  //-               :type="1"
  //-               :value="statCurrentPeriod.incomes.total"
  //-               size="xl"
  //-               vertical="left"
  //-             )
  //-           StatSummaryRowItemView(
  //-             :type="1"
  //-             :amount="statAverage.incomes"
  //-             :title="$t('money.average.incomes')"
  //-           )

  //-       template(#expenses)
  //-         .boxTitle {{ $t('money.expenses') }}

  //-         .boxSummary2
  //-           .boxSummary2__item
  //-             Amount(
  //-               :currency="$store.state.currencies.base"
  //-               :type="0"
  //-               :value="statCurrentPeriod.expenses.total"
  //-               size="xl"
  //-               vertical="left"
  //-             )
  //-           StatSummaryRowItemView(
  //-             :type="0"
  //-             :amount="statAverage.expenses"
  //-             :title="$t('money.average.expenses')"
  //-           )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.h100
  overflow hidden
  display grid
  height 100%
</style>
