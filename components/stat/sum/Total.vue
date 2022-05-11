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
