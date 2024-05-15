<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import useAmount from '~/components/amount/useAmount'
import type { MoneyTypeSlugSum } from '~/components/stat/types'
import type { TrnId } from '~/components/trns/types'

const props = defineProps<{
  trnsIds: TrnId[]
  type: MoneyTypeSlugSum
}>()

const currenciesStore = useCurrenciesStore()
const { getTotalOfTrnsIds } = useAmount()

const allTotal = computed(() => getTotalOfTrnsIds(props.trnsIds))
</script>

<template>
  <div class="grid gap-6">
    <div class="grid gap-3">
      <UiTitle5>{{ $t(`money.${props.type}`) }}</UiTitle5>

      <Amount
        :amount="allTotal[props.type]"
        :currencyCode="currenciesStore.base"
        align="left"
        variant="3xl"
      />
    </div>

    <div class="max-w-md">
      <TrnsList
        :trnsIds
        :type="props.type"
        groupedBy="year"
        isShowFilter
        isShowHeader
      />
    </div>
  </div>
</template>
