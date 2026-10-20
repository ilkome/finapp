<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { useCurrenciesStore } from '~/components/currencies/useCurrenciesStore'
import { useWalletMenuItems } from '~/components/wallets/useWalletMenuItems'
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

const contextMenuItems = computed(() => [
  [m.edit(props.walletId)],
  [m.delete(props.walletId, id => emit('delete', id))],
])
</script>

<template>
  <WalletsRow
    :baseCurrencyCode="currenciesStore.base"
    :contextMenuItems
    :to="`/wallets/${props.walletId}`"
    :wallet="walletsStore.itemsComputed[props.walletId]!"
    :walletId="props.walletId"
  >
    <template v-if="props.isSort" #before>
      <WalletsSortHandle />
    </template>
  </WalletsRow>
</template>
