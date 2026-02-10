<script lang="ts" setup>
import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletsCurrencyFiltered } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

defineProps<{
  currencyFiltered: WalletsCurrencyFiltered
}>()

const emit = defineEmits<{
  onSelectFilterCurrency: [code: CurrencyCode]
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()
</script>

<template>
  <UiTabs2 class="flex gap-1 @xl/page:px-0">
    <UiTabsItem1
      :isActive="currencyFiltered === 'all'"
      @click="emit('onSelectFilterCurrency', 'all')"
    >
      {{ t('common.all') }}
    </UiTabsItem1>

    <UiTabsItem1
      v-for="currency in walletsStore.currenciesUsed"
      :key="currency"
      :isActive="currencyFiltered === currency"
      @click="emit('onSelectFilterCurrency', currency)"
    >
      {{ currency }}
    </UiTabsItem1>
  </UiTabs2>
</template>
