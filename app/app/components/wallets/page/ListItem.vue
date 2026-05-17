<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

import { useWalletMenuItems } from '~/components/wallets/useWalletMenuItems'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  walletId: WalletId
}>()

const emit = defineEmits<{
  delete: [walletId: WalletId]
}>()

const walletsStore = useWalletsStore()
const m = useWalletMenuItems()

const contextMenuItems = computed(() => {
  const cv = m.creditView(props.walletId)
  return [
    ...(cv ? [[cv]] : []),
    [m.edit(props.walletId)],
    [m.delete(props.walletId, id => emit('delete', id))],
  ]
})
</script>

<template>
  <WalletsItem
    :wallet="walletsStore.itemsComputed[props.walletId]!"
    :walletId="props.walletId"
    :contextMenuItems="contextMenuItems"
    :lineWidth="2"
    class="group"
    isShowBaseRate
    isShowCreditLimit
    isShowIcon
    isShowRate
    :to="`/wallets/${props.walletId}`"
  />
</template>
