<script setup lang="ts">
import type { TabsItem } from '@nuxt/ui'

import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletsCurrencyFiltered } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  currencyFiltered: WalletsCurrencyFiltered
}>()

const emit = defineEmits<{
  selectFilterCurrency: [code: CurrencyCode]
}>()

const { t } = useI18n()
const walletsStore = useWalletsStore()

const items = computed<TabsItem[]>(() => [
  { label: t('common.all'), value: 'all' },
  ...walletsStore.currenciesUsed.map(currency => ({ label: currency, value: currency })),
])
</script>

<template>
  <UTabs
    :content="false"
    class="@xl/page:px-0"
    :items="items"
    :modelValue="props.currencyFiltered"
    @update:modelValue="(v) => emit('selectFilterCurrency', v as CurrencyCode)"
  />
</template>
