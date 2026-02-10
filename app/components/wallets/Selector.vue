<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId } from '~/components/wallets/types'

import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  activeItemId?: WalletId
  hide?: () => null
  selectedIds?: WalletId[]
}>()

const emit = defineEmits<{
  onSelected: [id: WalletId]
}>()

const walletsStore = useWalletsStore()

const currencyFiltered = useStorage<CurrencyCode>('finapp-wallets-selector-currency', 'all')
const selectedWalletsIdsWithCurrency = computed<WalletId[]>(() => {
  return Object.keys(walletsStore.itemsComputed).filter((id) => {
    const wallet = walletsStore.itemsComputed[id]
    return !wallet?.isArchived && (currencyFiltered.value === 'all' || currencyFiltered.value === wallet?.currency)
  })
})

function onClickWallet(walletId: WalletId) {
  emit('onSelected', walletId)

  if (props.hide)
    props.hide()
}
</script>

<template>
  <div
    class="grid h-full gap-2 overflow-hidden"
    :class="{ 'grid-rows-[auto_1fr]': walletsStore.currenciesUsed.length > 1 }"
  >
    <div
      v-if="walletsStore.currenciesUsed.length > 1"
      class="grid md:max-w-xs"
    >
      <WalletsCurrencies
        :currencyFiltered
        @onSelectFilterCurrency="code => currencyFiltered = code"
      />
    </div>

    <div class="scrollerBlock h-full overflow-y-auto py-px">
      <WalletsItem
        v-for="walletId in selectedWalletsIdsWithCurrency"
        :key="walletId"
        :activeItemId="props.activeItemId || (props.selectedIds?.includes(walletId) ? walletId : null)"
        :walletId
        :wallet="walletsStore.itemsComputed[walletId]"
        :lineWidth="4"
        class="group/item"
        isShowIcon
        isShowCreditLimit
        @click="onClickWallet(walletId)"
      />
    </div>
  </div>
</template>
