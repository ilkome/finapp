<script>
export default {
  methods: {
    handleSetWallet (walletId) {
      this.$store.commit('trnForm/closeTrnFormModal', 'wallets')
      this.$store.commit('trnForm/setTrnFormValues', { walletId })
    }
  }
}
</script>

<template lang="pug">
TrnFormModal.doNotCloseTrnModal(
  :isShow="$store.state.trnForm.modal.wallets"
  :position="$store.state.ui.mobile ? 'bottom' : null"
  :title="$t('wallets.title')"
  @onClose="$store.commit('trnForm/closeTrnFormModal', 'wallets')"
)
  .trnFormWalletsList
    WalletsList3(
      :activeItemId="$store.state.trnForm.values.walletId"
      :limit="6"
      :showBase="false"
      showToogle
      ui="widget"
      @onClick="handleSetWallet"
    )
</template>

<style lang="stylus">
@import '~assets/stylus/variables/margins'

.trnFormWalletsList
  .walletsList__toogle
    margin 0
    padding-bottom 0
    text-align center
    border-top 0
</style>
