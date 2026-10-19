<script setup lang="ts">
import type { CurrencyCode } from '~/components/currencies/types'

import { useCurrencyOptions } from '~/components/currencies/useCurrencyOptions'
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
const { options } = useCurrencyOptions()

const used = computed(() => {
  const codes = new Set(walletsStore.currenciesUsed)
  return options.value.filter(option => codes.has(option.code))
})
</script>

<template>
  <CurrenciesListView
    :active="props.active"
    :all="options"
    :isHideUnused="props.isHideUnused"
    :isShowAllButton="props.isShowAllButton"
    :used
    @select="emit('select', $event)"
  />
</template>
