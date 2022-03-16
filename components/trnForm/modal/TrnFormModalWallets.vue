<script>
export default {
  methods: {
    handleSetWallet(walletId, close) {
      this.$store.commit('trnForm/setTrnFormValues', { walletId })
      close()
    },

    afterClose() {
      this.$store.commit('trnForm/closeTrnFormModal', 'wallets')
    },
  },
}
</script>

<template lang="pug">
TrnFormModal(@closed="afterClose")
  template(#header)
    template {{ $t('wallets.title') }}

  template(#default="{ close }")
    .trnFormWalletsList.scrollerBlock
      WalletsList3(
        :activeItemId="$store.state.trnForm.values.walletId"
        :showBase="false"
        @onClick="walletId => handleSetWallet(walletId, close)"
      )
</template>

<style lang="stylus">
.trnFormWalletsList
  overflow hidden
  overflow-y auto
  height 100%
</style>
