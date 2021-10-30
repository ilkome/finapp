<script>
export default {
  methods: {
    handleSetWallet (walletId, close) {
      this.$store.commit('trnForm/setTrnFormValues', { walletId })
      close()
    },

    afterClose () {
      this.$store.commit('trnForm/closeTrnFormModal', 'wallets')
    }
  }
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
        ui="widget"
        @onClick="walletId => handleSetWallet(walletId, close)"
      )
</template>

<style lang="stylus">
@import '~assets/stylus/variables'

.trnFormWalletsList
  overflow hidden
  overflow-y auto
  height 100%

  .wallets__toogle
    button-base-1()
    margin-top $m7
    margin-bottom $m5
</style>
