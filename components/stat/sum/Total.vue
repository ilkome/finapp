<script setup script="ts">
const { $store } = useNuxtApp()
const statCurrentPeriod = computed(() => $store.getters['stat/statCurrentPeriod'])
const statAverage = computed(() => $store.getters['stat/statAverage'])
</script>

<template lang="pug">
.swiper-container(ref="sliderRef")
  .swiper-wrapper
    //- Total
    .swiper-slide.grow(class="!w-auto")
      .statTitle {{ $t('money.total') }}
      .flex.items-center
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
