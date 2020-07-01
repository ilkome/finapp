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
  :title="$lang.wallets.title"
  :position="$store.state.ui.mobile ? 'bottom' : null"
  @onClose="$store.commit('trnForm/toogleTrnFormModal', 'wallets')"
)
  .trnFormWalletsList
    WalletsList(
      :limit="6"
      showToogle
      ui="widget"
      @onClick="handleSetWallet"
    )
</template>

<style lang="stylus">
@import "~assets/stylus/variables/margins"

.trnFormWalletsList
  .walletsWidget
    display grid
    grid-template-columns repeat(3, minmax(auto, 1fr))
    grid-column-gap 12px
    grid-row-gap 12px
    padding 0 16px

  .walletItemWidget
    overflow hidden
    cursor pointer
    padding $m6
    border-radius $m4

  .walletsList__toogle
    border-top 0
    padding-bottom 0
</style>
