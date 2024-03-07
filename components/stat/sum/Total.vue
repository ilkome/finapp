<script setup script="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useStat } from '~/components/stat/useStat'

const currenciesStore = useCurrenciesStore()
const { statAverage, statCurrentPeriod } = useStat()
</script>

<template>
  <div class="rounded-lg bg-item-4 px-2 py-2">
    <UiTitle>{{ $t("money.total") }}</UiTitle>
    <div class="scrollbar overflow-hidden overflow-x-auto pt-2">
      <div class="flex flex-wrap items-center gap-1 gap-x-6">
        <div class="text-3xl">
          <Amount
            :amount="
              statCurrentPeriod.income.total - statCurrentPeriod.expense.total
            "
            :colorize="
              statCurrentPeriod.income.total - statCurrentPeriod.expense.total
                > 0
                ? 'income'
                : 'expense'
            "
            :currencyCode="currenciesStore.base"
            :isShowBaseRate="false"
            :isShowSign="false"
            :type="
              statCurrentPeriod.income.total - statCurrentPeriod.expense.total
                > 0
                ? 1
                : 0
            "
          />
        </div>

        <LazyStatSumAverage
          v-if="statAverage && statAverage.sum !== 0"
          :type="statAverage.sum > 0 ? 1 : 0"
          :amount="statAverage.sum"
          :title="$t('money.averageTotal')"
        />
      </div>
    </div>
  </div>
</template>
