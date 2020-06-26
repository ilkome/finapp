<script>
import Icon from '~/components/icon/Icon'
import TrnFormModal from '~/components/trnForm/TrnFormModal'
import WalletsList from '~/components/wallets/list/WalletsList'

export default {
  components: {
    Icon,
    TrnFormModal,
    WalletsList
  },

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
  :show="$store.state.trnForm.modal.wallets"
  title=""
  v-on:onClose="$store.commit('trnForm/toogleTrnFormModal', 'wallets')"
)
  template(slot="header")
    .trnFormModal__header__back: .mdi.mdi-chevron-left
    .trnFormModal__header__title {{ $lang.wallets.title }}

  .trnFormWalletsList
    WalletsList(
      ui="tile"
      @onClick="handleSetWallet"
    )
</template>

<style lang="stylus">
.trnFormWalletsList
  .walletsTiles
    grid-template-columns repeat(2, 1fr)
</style>
