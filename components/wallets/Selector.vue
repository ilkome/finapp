<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'
import { useWalletsStore } from '~/components/wallets/useWalletsStore'

const props = defineProps<{
  activeItemId?: WalletId
  hide?: () => null
}>()

const emit = defineEmits<{
  onSelected: [id: WalletId]
}>()

const walletsStore = useWalletsStore()

function onClickWallet(walletId: WalletId) {
  emit('onSelected', walletId)

  if (props.hide)
    props.hide()
}
</script>

<template>
  <div class="p-2 py-2.5 bg-item-4 overflow-hidden overflow-y-auto max-h-[60vh]">
    <WalletsItem
      v-for="(wallet, walletId) in walletsStore.sortedItems"
      :key="walletId"
      :activeItemId="props.activeItemId"
      :walletId
      :wallet
      isHideDots
      @click="onClickWallet(walletId)"
    />
  </div>
</template>
