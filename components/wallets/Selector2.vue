<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'
import useWallets from '~/components/wallets/useWallets'

const props = defineProps<{
  hide?: () => null
}>()

const emit = defineEmits<{
  onSelected: [id: WalletId]
}>()

const { walletsItemsSorted } = useWallets()

function onClickWallet(walletId: WalletId) {
  emit('onSelected', walletId)

  if (props.hide)
    props.hide()
}
</script>

<template>
  <div class="p-2 py-2.5 bg-item-4 overflow-hidden overflow-y-auto w-[90vw] max-w-xs max-h-[60vh]">
    <WalletsItem
      v-for="(wallet, walletId) in walletsItemsSorted"
      :key="walletId"
      :walletId
      :wallet
      isHideDots
      @click="onClickWallet(walletId)"
    />
  </div>
</template>
