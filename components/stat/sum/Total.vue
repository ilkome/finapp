<script setup script="ts">
const { $store } = useNuxtApp()
const statCurrentPeriod = computed(() => $store.getters['stat/statCurrentPeriod'])
const statAverage = computed(() => $store.getters['stat/statAverage'])
</script>

<template lang="pug">
.my-4.px-2.bg-white.dark_bg-dark3
  .pb-2.text-lg.leading-none.font-nunito.font-semibold.text-skin-item-base {{ $t('money.total') }}
  .overflow-hidden.overflow-x-auto.scrollbar
    .flex.items-center
      //- Total
      .pr-6.text-4xl
        Amount(
          :amount="statCurrentPeriod.incomes.total - statCurrentPeriod.expenses.total"
          :colorize="(statCurrentPeriod.incomes.total - statCurrentPeriod.expenses.total) > 0 ? 'income' : 'expense'"
          :currency="$store.state.currencies.base"
          :isShowBaseRate="false"
          :isShowSign="false"
          :type="(statCurrentPeriod.incomes.total - statCurrentPeriod.expenses.total) > 0 ? 1 : 0"
        )

      LazyStatSummaryRowItemView(
        v-if="statAverage.incomes - statAverage.expenses !== 0"
        :type="(statAverage.incomes - statAverage.expenses) > 0 ? 1 : 0"
        :amount="statAverage.incomes - statAverage.expenses"
        :title="$t('money.averageTotal')"
      )
</template>
