<script>
export default {
  methods: {
    handleSetWallet (walletId) {
      this.$store.commit('trnForm/toogleTrnFormModal', 'wallets')
      this.$store.commit('trnForm/setTrnFormValues', { walletId })
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(
  v-if="$store.state.trnForm.modal.wallets"
  :show="$store.state.trnForm.modal.wallets"
  :title="$t('wallets.title')"
  :position="$store.state.ui.mobile ? 'bottom' : null"
  @onClose="$store.commit('trnForm/toogleTrnFormModal', 'wallets')"
)
  .trnFormWalletsList
    WalletsList3(
      :limit="6"
      :showBase="false"
      showToogle
      ui="widget"
      @onClick="handleSetWallet"
    )
</template>

<style lang="stylus">
@import "~assets/stylus/variables/margins"

.trnFormWalletsList
  .walletsList__toogle
    margin 0
    padding-bottom 0
    text-align center
    border-top 0
</style>
