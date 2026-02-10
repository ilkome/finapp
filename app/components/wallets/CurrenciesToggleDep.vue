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
  <UiToggleWithStorage
    :initStatus="true"
    :lineWidth="0"
    class="grid md:max-w-lg @xl/page:max-w-xl"
    storageKey="finapp-wallets-currencies"
  >
    <template #header="{ toggle, isShown }">
      <UiTitle8
        :isShown
        @click="toggle"
      >
        {{ t('wallets.filterByCurrency') }}
        {{ (currencyFiltered !== 'all' && !isShown) ? currencyFiltered : '' }}
      </UiTitle8>
    </template>

    <UiTabs2 class="flex gap-1 px-2 @xl/page:px-0">
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
  </UiToggleWithStorage>
</template>
