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
      .pr-6.text-3xl
        Amount(
          :amount="statCurrentPeriod.income.total - statCurrentPeriod.expense.total"
          :colorize="(statCurrentPeriod.income.total - statCurrentPeriod.expense.total) > 0 ? 'income' : 'expense'"
          :currencyCode="$store.state.currencies.base"
          :isShowBaseRate="false"
          :isShowSign="false"
          :type="(statCurrentPeriod.income.total - statCurrentPeriod.expense.total) > 0 ? 1 : 0"
        )

      LazyStatSumAverage(
        v-if="statAverage.sum !== 0"
        :type="statAverage.sum > 0 ? 1 : 0"
        :amount="statAverage.sum"
        :title="$t('money.averageTotal')"
      )
</template>
