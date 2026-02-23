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
  <UiToggleWithStorage
    :initStatus="true"
    :lineWidth="0"
    class="grid md:max-w-lg @xl/page:max-w-xl"
    storageKey="finapp-wallets-currencies"
  >
    <template #header="{ toggle, isShown }">
      <UiTitleCollapse
        :isShown
        @click="toggle"
      >
        {{ t('wallets.filterByCurrency') }}
        {{ (currencyFiltered !== 'all' && !isShown) ? currencyFiltered : '' }}
      </UiTitleCollapse>
    </template>

    <UiTabsScroll class="flex gap-1 px-2 @xl/page:px-0">
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
  </UiToggleWithStorage>
</template>
