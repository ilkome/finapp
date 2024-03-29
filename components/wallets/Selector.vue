<script setup lang="ts">
import type { WalletId } from '~/components/wallets/types'

defineProps<{
  // isShow: boolean
  title: string
}>()

const emit = defineEmits<{
  onSelected: [id: WalletId]
  onClose: []
}>()

function onClickWallet(walletId: WalletId, close: () => void) {
  emit('onSelected', walletId)
  close()
}
</script>

<template lang="pug">
TrnFormModal(
  @closed="emit('onClose')"
)
  template(#header)
    div {{ title }}

  template(#default="{ close }")
    WalletsList(#default="{ walletsItemsSorted }")
      .px-2
        WalletsItem2(
          v-for="(wallet, walletId) in walletsItemsSorted"
          :key="walletId"
          :walletId
          :wallet
          isHideDots
          @click="onClickWallet(walletId, close)"
        )
</template>
