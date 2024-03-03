<script setup script="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useStat } from '~/components/stat/useStat'

const currenciesStore = useCurrenciesStore()
const { statAverage, statCurrentPeriod } = useStat()
</script>

<template lang="pug">
.my-4.px-1.bg-white.dark_bg-dark3
  UiTitle {{ $t('money.total') }}
  .overflow-hidden.overflow-x-auto.scrollbar
    .flex.flex-wrap.items-center.gap-1.gap-x-6
      .text-3xl
        Amount(
          :amount="statCurrentPeriod.income.total - statCurrentPeriod.expense.total"
          :colorize="(statCurrentPeriod.income.total - statCurrentPeriod.expense.total) > 0 ? 'income' : 'expense'"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :isShowSign="false"
          :type="(statCurrentPeriod.income.total - statCurrentPeriod.expense.total) > 0 ? 1 : 0"
        )

      LazyStatSumAverage(
        v-if="statAverage && statAverage.sum !== 0"
        :type="statAverage.sum > 0 ? 1 : 0"
        :amount="statAverage.sum"
        :title="$t('money.averageTotal')"
      )
</template>
