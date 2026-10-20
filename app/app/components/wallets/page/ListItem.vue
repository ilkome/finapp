<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useWalletMenuItems } from '~/components/wallets/useWalletMenuItems'
import { useWalletSheet } from '~/components/wallets/useWalletSheet'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  isSort?: boolean
  walletId: WalletId
}>()

const emit = defineEmits<{
  delete: [walletId: WalletId]
}>()

const walletsStore = useWalletsStore()
const currenciesStore = useCurrenciesStore()
const m = useWalletMenuItems()
const walletSheet = useWalletSheet()

const contextMenuItems = computed(() => [
  [m.edit(props.walletId)],
  [m.delete(props.walletId, id => emit('delete', id))],
])
</script>

<template>
  <WalletsRow
    :baseCurrencyCode="currenciesStore.base"
    :contextMenuItems
    :wallet="walletsStore.itemsComputed[props.walletId]!"
    :walletId="props.walletId"
    @click="walletSheet = props.walletId"
  >
    <template v-if="props.isSort" #before>
      <WalletsSortHandle />
    </template>
  </WalletsRow>
</template>
