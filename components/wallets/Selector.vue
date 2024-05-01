<script setup lang="ts">
import { useWalletsStore } from '~/components/wallets/useWalletsStore'
import type { WalletId } from '~/components/wallets/types'

const props = defineProps<{
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
  <div class="p-2 py-2.5 bg-item-4 overflow-hidden overflow-y-auto w-[90vw] max-w-xs max-h-[60vh]">
    <WalletsItem
      v-for="(wallet, walletId) in walletsStore.sortedItems"
      :key="walletId"
      :walletId
      :wallet
      isHideDots
      @click="onClickWallet(walletId)"
    />
  </div>
</template>
