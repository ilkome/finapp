<script>
import TrnFormModal from '~/components/trnForm/TrnFormModal'
import WalletsList from '~/components/wallets/list/WalletsList'

export default {
  components: {
    TrnFormModal,
    WalletsList
  },

  methods: {
    handleSetWallet (walletId) {
      this.$store.commit('trnForm/toogleTrnFormModal', 'transferFrom')
      this.$store.commit('trnForm/setTrnFormTransfer', {
        tranferType: 'from',
        walletId
      })
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(
  :show="$store.state.trnForm.modal.transferFrom"
  title=""
  v-on:onClose="$store.commit('trnForm/toogleTrnFormModal', 'transferFrom')"
)
  template(slot="header")
    .trnFormModal__header__back: .mdi.mdi-chevron-left
    .trnFormModal__header__title Transfer from wallet

  WalletsList(
    ui="tile"
    v-on:onClick="handleSetWallet"
  )
</template>
