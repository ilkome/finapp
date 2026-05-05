<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletsCurrencyFiltered } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

defineProps<{
  currencyFiltered: WalletsCurrencyFiltered
}>()

const emit = defineEmits<{
  selectFilterCurrency: [code: CurrencyCode]
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
</script>

<template>
  <UiTabsScroll class="flex gap-1 @xl/page:px-0">
    <UiTabsItemFill
      :isActive="currencyFiltered === 'all'"
      @click="emit('selectFilterCurrency', 'all')"
    >
      {{ t('common.all') }}
    </UiTabsItemFill>

    <UiTabsItemFill
      v-for="currency in walletsStore.currenciesUsed"
      :key="currency"
      :isActive="currencyFiltered === currency"
      @click="emit('selectFilterCurrency', currency)"
    >
      {{ currency }}
    </UiTabsItemFill>
  </UiTabsScroll>
</template>
