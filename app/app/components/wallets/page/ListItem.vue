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

const contextMenuItems = computed(() => [
  [m.edit(props.walletId)],
  [m.delete(props.walletId, id => emit('delete', id))],
])
</script>

<template>
  <UiRowBackground class="group" type="standard">
    <WalletsItem
      :wallet="walletsStore.itemsComputed[props.walletId]!"
      :walletId="props.walletId"
      :contextMenuItems="contextMenuItems"
      isShowBaseRate
      isShowCreditLimit
      isShowIcon
      isShowRate
      :to="`/wallets/${props.walletId}`"
    />
  </UiRowBackground>
</template>
