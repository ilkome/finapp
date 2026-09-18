<script setup lang="ts">
import type { FilterExtras } from '~/components/filter/extras'

import { getCurrencySymbol } from '~/components/amount/utils'
import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useExtrasLabels } from '~/components/filter/useExtrasLabels'

const extras = defineModel<FilterExtras>({ required: true })

const currenciesStore = useCurrenciesStore()
const { descItems, typeItems } = useExtrasLabels()
</script>

<template>
  <FilterMoreFormView
    v-model="extras"
    :amountCurrencySymbol="getCurrencySymbol(currenciesStore.base)"
    :descItems
    :typeItems
  />
</template>
