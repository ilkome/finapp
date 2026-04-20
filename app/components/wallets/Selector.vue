<script setup lang="ts">
import { useStorage } from '@vueuse/core'

import type { CurrencyCode } from '~/components/currencies/types'
import type { WalletId } from '~/components/wallets/types'

import { WALLET_STORAGE_KEYS } from '~/components/wallets/constants'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  activeItemId?: WalletId
  disabledIds?: WalletId[]
  hide?: () => void
  selectedIds?: WalletId[]
}>()

const emit = defineEmits<{
  selected: [id: WalletId]
}>()

const walletsStore = useWalletsStore()

const currencyFiltered = useStorage<CurrencyCode>(WALLET_STORAGE_KEYS.selectorCurrency, 'all')
const selectedWalletsIdsWithCurrency = computed<WalletId[]>(() => {
  return Object.keys(walletsStore.itemsComputed).filter((id) => {
    const wallet = walletsStore.itemsComputed[id]
    return !wallet?.isArchived
      && !props.disabledIds?.includes(id)
      && (currencyFiltered.value === 'all' || currencyFiltered.value === wallet?.currency)
  })
})

function onClickWallet(walletId: WalletId) {
  emit('selected', walletId)

  if (props.hide)
    props.hide()
}
</script>

<template>
  <div class="relative grid h-full overflow-hidden">
    <div
      class="scrollerBlock h-full overflow-y-auto py-px"
      :class="{ 'pb-16': walletsStore.currenciesUsed.length > 1 }"
    >
      <WalletsItem
        v-for="walletId in selectedWalletsIdsWithCurrency"
        :key="walletId"
        :activeItemId="props.activeItemId || (props.selectedIds?.includes(walletId) ? walletId : null)"
        :walletId
        :wallet="walletsStore.itemsComputed[walletId]!"
        :lineWidth="4"
        class="group/item"
        isShowIcon
        isShowCreditLimit
        @click="onClickWallet(walletId)"
      />
    </div>

    <template v-if="walletsStore.currenciesUsed.length > 1">
      <div
        class="pointer-events-none absolute bottom-0 left-0 z-10 h-12 w-full"
        style="background: linear-gradient(to bottom, transparent, var(--ui-bg))"
      />
      <div class="pointer-events-none absolute bottom-2 left-0 z-20 w-full px-2">
        <div class="border-default/80 bg-default/20 pointer-events-auto rounded-2xl border p-1 shadow-lg backdrop-blur-xl dark:bg-neutral-800/50">
          <WalletsCurrencies
            :currencyFiltered
            @selectFilterCurrency="code => currencyFiltered = code"
          />
        </div>
      </div>
    </template>
  </div>
</template>
