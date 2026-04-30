<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'

const props = defineProps<{
  amount: number
  isPrimary?: boolean
  label: string
  secondaryAmount?: number
  secondaryCurrency?: CurrencyCode
}>()

const currenciesStore = useCurrenciesStore()
</script>

<template>
  <div class="font-tertiary text-base leading-none font-semibold" :class="[props.isPrimary && '!text-toned']">
    {{ props.label }}
  </div>

  <div class="ml-auto" :class="[props.isPrimary && 'opacity-60']">
    <Amount
      :amount="props.amount"
      :currencyCode="currenciesStore.base"
      :isShowBaseRate="false"
      :variant="props.isPrimary ? 'sm' : undefined"
    />
    <Amount
      v-if="props.secondaryAmount != null"
      :amount="props.secondaryAmount"
      :currencyCode="props.secondaryCurrency!"
      :isShowBaseRate="false"
      variant="2xs"
    />
  </div>
</template>
