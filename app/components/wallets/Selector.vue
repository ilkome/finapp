<script setup lang="ts">
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

function onClickWallet(walletId: WalletId) {
  emit('onSelected', walletId)

  if (props.hide)
    props.hide()
}
</script>

<template>
  <div>
    <WalletsItem
      v-for="(wallet, walletId) in walletsStore.itemsComputed"
      :key="walletId"
      :activeItemId="props.activeItemId || (props.selectedIds?.includes(walletId) ? walletId : null)"
      :walletId
      :wallet
      :lineWidth="4"
      class="group/item"
      isShowIcon
      @click="onClickWallet(walletId)"
    />
  </div>
</template>
