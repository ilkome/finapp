<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'
import useWallets from '~/components/wallets/useWallets'

const emit = defineEmits<{
  onSelected: [id: WalletId]
}>()

const { walletsItemsSorted } = useWallets()

function onClickWallet(walletId: WalletId) {
  emit('onSelected', walletId)
}
</script>

<template>
  <div class="p-2 py-2.5 bg-item-4 overflow-hidden overflow-y-auto max-h-[60vh]">
    <WalletsItem2
      v-for="(wallet, walletId) in walletsItemsSorted"
      :key="walletId"
      :walletId
      :wallet
      isHideDots
      @click="onClickWallet(walletId)"
    />
  </div>
</template>
