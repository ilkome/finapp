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
        :limit="6"
        :showBase="false"
        showToogle
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
  padding-bottom 16px

  .walletsList__toogle
    margin 0
    padding-bottom 0
    text-align center
    border-top 0
</style>
