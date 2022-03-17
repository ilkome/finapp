<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { $store } = useNuxtApp()
const { height } = useWindowSize()

function onClickWallet(walletId, close) {
  $store.commit('trnForm/setTrnFormValues', { expenseWalletId: walletId })
  close()
}

function closed() {
  $store.commit('trnForm/closeTrnFormModal', 'transferFrom')
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
    .subTitle.pt-6.text-center.text-xs {{ $t('transfer') }}
    .pt-3.pb-3.px-3
      WalletsList3(
        @onClick="walletId => onClickWallet(walletId, close)"
      )
</template>

<i18n lang="json5">
{
  "en": {
    "transfer": "Transfer from wallet",
  },
  "ru": {
    "transfer": "Перевод из кошелька",
  },
}
</i18n>
