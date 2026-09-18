<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

import { currencies } from '~/components/currencies/currencies'
import { useCurrencyName } from '~/components/currencies/useCurrencyName'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  active?: string
  isHideUnused?: boolean
  isShowAllButton?: boolean
}>()
const emit = defineEmits<{
  select: [code: CurrencyCode]
}>()

const walletsStore = useWalletsStore()
const { getCurrencyName } = useCurrencyName()

const all = computed(() => currencies.map(currency => ({ code: currency.code, name: getCurrencyName(currency.code) })))
const used = computed(() => walletsStore.currenciesUsed.map(code => ({ code, name: getCurrencyName(code) })))
</script>

<template>
  <CurrenciesListView
    :active="props.active"
    :all
    :isHideUnused="props.isHideUnused"
    :isShowAllButton="props.isShowAllButton"
    :used
    @select="emit('select', $event)"
  />
</template>
