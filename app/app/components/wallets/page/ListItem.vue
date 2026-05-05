<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { useWalletContextMenu } from '~/components/wallets/useWalletContextMenu'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  walletId: WalletId
}>()

const emit = defineEmits<{
  delete: [walletId: WalletId]
}>()

const walletsStore = useWalletsStore()

const { getWalletContextMenuItems } = useWalletContextMenu({
  onDelete: (id: WalletId) => emit('delete', id),
})
</script>

<template>
  <WalletsItem
    :wallet="walletsStore.itemsComputed[props.walletId]!"
    :walletId="props.walletId"
    :contextMenuItems="getWalletContextMenuItems(props.walletId)"
    :lineWidth="2"
    class="group"
    isShowBaseRate
    isShowCreditLimit
    isShowIcon
    isShowRate
    :to="`/wallets/${props.walletId}`"
  />
</template>
