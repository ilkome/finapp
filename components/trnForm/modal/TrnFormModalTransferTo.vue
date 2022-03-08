<script setup lang="ts">
const { $store } = useNuxtApp()

function onClickWallet(walletId, close) {
  $store.commit('trnForm/setTrnFormValues', { incomeWalletId: walletId })
  close()
}

function afterClose() {
  $store.commit('trnForm/closeTrnFormModal', 'transferTo')
}
</script>

<template lang="pug">
TrnFormModal(@closed="afterClose")
  template(#header)
    template {{ $t('transfer') }}

  template(#default="{ close }")
    .trnFormWalletsList.scrollerBlock
      WalletsList3(@onClick="walletId => onClickWallet(walletId, close)")
</template>

<style lang="stylus">
.trnFormWalletsList
  overflow hidden
  overflow-y auto
  height 100%
  padding-bottom 16px
</style>

<i18n lang="json5">
{
  "en": {
    "transfer": "Transfer to wallet",
  },
  "ru": {
    "transfer": "Перевод в кошелек",
  },
}
</i18n>
