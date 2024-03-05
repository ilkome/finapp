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

const typeNumber = computed(() => moneyTypes.find(t => t.id === `${props.typeText}`.toLowerCase())?.type)
</script>

<template lang="pug">
.my-4.px-1.bg-foreground-3
  UiTitle {{ $t(`money.${typeText}`) }}

  .overflow-hidden.overflow-x-auto.scrollbar
    .flex.flex-wrap.items-center.gap-1.gap-x-6
      //- Total
      .text-3xl
        Amount(
          :amount="statPage.current[typeText].total"
          :colorize="typeText"
          :currencyCode="currenciesStore.base"
          :isShowBaseRate="false"
          :type="typeNumber"
        )

      //- Average
      LazyStatSumAverage(
        v-if="statPage.average[typeText] !== 0"
        :amount="statPage.average[typeText]"
        :title="$t(`money.average.${typeText}`)"
        :type="typeNumber"
      )
</template>
