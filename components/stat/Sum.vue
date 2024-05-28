<script setup lang="ts">
import { useCurrenciesStore } from '~/components/currencies/useCurrencies'
import type { MoneyTypeSlugNew } from '~/components/stat/types'

const props = defineProps<{
  amount: number
  isTotal?: boolean
  type: MoneyTypeSlugNew
}>()

const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div class="grid gap-2">
    <UiTitle5>
      {{ props.isTotal ? $t('money.all') : '' }}
      {{ $t(`money.${props.type}`) }}
    </UiTitle5>

    <Amount
      :amount="props.amount"
      :currencyCode="currenciesStore.base"
      align="left"
      variant="3xl"
    />
  </div>
</template>
