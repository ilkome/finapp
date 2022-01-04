<script>
import { computed, useNuxtApp, defineComponent } from '#app'

export default defineComponent({
  setup () {
    const { $store } = useNuxtApp()
    const statCurrentPeriod = computed(() => $store.getters['stat/statCurrentPeriod'])
    const statAverage = computed(() => $store.getters['stat/statAverage'])

    return {
      statCurrentPeriod,
      statAverage
    }
  }
})
</script>

<template lang="pug">
.py-6.px-3
  .statTitle {{ $t('money.total') }}
  .overflow-hidden.overflow-x-auto.scrollbar
    .flex
      .pr-6
        Amount(
          :currency="$store.state.currencies.base"
          :type="(statCurrentPeriod.incomes.total - statCurrentPeriod.expenses.total) > 0 ? 1 : 0"
          :value="statCurrentPeriod.incomes.total - statCurrentPeriod.expenses.total"
          size="xl"
          vertical="left"
        )

      LazyStatSummaryRowItemView(
        v-if="statAverage.incomes - statAverage.expenses !== 0"
        :type="(statAverage.incomes - statAverage.expenses) > 0 ? 1 : 0"
        :amount="statAverage.incomes - statAverage.expenses"
        :title="$t('money.averageTotal')"
      )
</template>
