<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletsCurrencyFiltered } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  currencyFiltered: WalletsCurrencyFiltered
  menuStyle?: boolean
}>()

const emit = defineEmits<{
  selectFilterCurrency: [code: CurrencyCode]
}>()

const walletsStore = useWalletsStore()
</script>

<template>
  <WalletsCurrenciesView
    :currenciesUsed="walletsStore.currenciesUsed"
    :currencyFiltered="props.currencyFiltered"
    :menuStyle="props.menuStyle"
    @selectFilterCurrency="emit('selectFilterCurrency', $event)"
  />
</template>
