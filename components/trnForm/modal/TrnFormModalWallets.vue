<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { $store } = useNuxtApp()
const { height } = useWindowSize()

function onClickWallet(walletId, close) {
  $store.commit('trnForm/setTrnFormValues', { walletId })
  close()
}

function closed() {
  $store.commit('trnForm/closeTrnFormModal', 'wallets')
}
</script>

<template lang="pug">
BaseBottomSheet(
  :maxHeight="height"
  insideClass="rounded-t-2xl bg-skin-layout-main"
  @closed="closed"
)
  template(#handler="{ close }")
    BaseBottomSheetHandler
    BaseBottomSheetClose(@onClick="close")

  template(#default="{ close }")
    .pt-6.pb-3.px-3
      WalletsList3(
        :activeItemId="$store.state.trnForm.values.walletId"
        :showBase="false"
        @onClick="walletId => onClickWallet(walletId, close)"
      )
</template>
