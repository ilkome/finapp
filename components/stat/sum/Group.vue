<script setup lang="ts">
import useStatPage from '~/components/stat/useStatPage'
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import { useStat } from '~/components/stat/useStat'

const props = defineProps<{
  typeText: 'income' | 'expense'
}>()

const { statPage } = useStatPage()
const { moneyTypes } = useStat()
const currenciesStore = useCurrenciesStore()

const typeNumber = computed(
  () =>
    moneyTypes.find(t => t.id === `${props.typeText}`.toLowerCase())?.type,
)
</script>

<template>
  <div class="rounded-lg bg-item-4 px-2 py-2">
    <UiTitle>{{ $t(`money.${typeText}`) }}</UiTitle>

    <div class="scrollbar overflow-hidden overflow-x-auto pt-2">
      <div class="flex flex-wrap items-center gap-1 gap-x-6">
        <!-- Total -->
        <div class="text-3xl">
          <Amount
            :amount="statPage.current[typeText].total"
            :colorize="typeText"
            :currencyCode="currenciesStore.base"
            :isShowBaseRate="false"
            :type="typeNumber"
          />
        </div>

        <!-- Average -->
        <LazyStatSumAverage
          v-if="statPage.average[typeText] !== 0"
          :amount="statPage.average[typeText]"
          :title="$t(`money.average.${typeText}`)"
          :type="typeNumber"
        />
      </div>
    </div>
  </div>
</template>
