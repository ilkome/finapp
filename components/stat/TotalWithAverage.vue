<script setup lang="ts">
import useStatPage from '~/components/stat/useStatPage'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useStat } from '~/components/stat/useStat'
import type { MoneyTypeNumber, MoneyTypeSlugSum } from '~/components/stat/types'

const props = defineProps<{
  moneyTypeSlugSum: MoneyTypeSlugSum
}>()

const { statPage } = useStatPage()
const { moneyTypes } = useStat()
const { statAverage, statCurrentPeriod } = useStat()
const currenciesStore = useCurrenciesStore()

const moneyTypeNumber = computed<MoneyTypeNumber | undefined>(
  () =>
    moneyTypes.find(t => t.id === `${props.moneyTypeSlugSum}`.toLowerCase())
      ?.type,
)

const amount = computed(() => {
  if (props.moneyTypeSlugSum === 'sum')
    return statPage.current.income.total - statPage.current.expense.total

  return statPage.current[props.moneyTypeSlugSum].total
})

const colorize = computed(() => {
  if (props.moneyTypeSlugSum === 'sum') {
    return statCurrentPeriod.value.income.total - statCurrentPeriod.value.expense.total > 0
      ? 'income'
      : 'expense'
  }
  return props.moneyTypeSlugSum
})

const isShownAverage = computed(() => {
  if (props.moneyTypeSlugSum === 'sum')
    return statAverage.value?.sum !== 0
  return statPage.average[props.moneyTypeSlugSum] !== 0
})

const averageAmount = computed(() => {
  if (props.moneyTypeSlugSum === 'sum')
    return statAverage.value?.sum
  return statPage.average[props.moneyTypeSlugSum]
})
</script>

<template>
  <div class="rounded-lg bg-item-4 px-2 py-2 sm_px-5 sm_py-4">
    <UiTitle2>{{ $t(`money.${moneyTypeSlugSum}`) }}</UiTitle2>

    <div
      class="sm_flex-col2 flex flex-wrap items-start gap-2 gap-x-6 overflow-hidden overflow-x-auto pt-2"
    >
      <!-- Total -->
      <div class="text-3xl">
        <Amount
          :amount="amount"
          :colorize="colorize"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :type="moneyTypeNumber"
        />
      </div>

      <!-- Average -->
      <div v-if="isShownAverage">
        <UiTextSmall>{{ $t(`money.average.${moneyTypeSlugSum}`) }}</UiTextSmall>
        <Amount
          :amount="averageAmount"
          :currencyCode="currenciesStore.base"
          :type="moneyTypeNumber"
          :colorize="moneyTypeSlugSum"
          :isShowBaseRate="false"
          :isShowSign="false"
        />
      </div>
    </div>
  </div>
</template>
