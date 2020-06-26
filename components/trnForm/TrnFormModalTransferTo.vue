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
      this.$store.commit('trnForm/toogleTrnFormModal', 'transferTo')
      this.$store.commit('trnForm/setTrnFormTransfer', {
        tranferType: 'to',
        walletId
      })
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(
  :show="$store.state.trnForm.modal.transferTo"
  title=""
  v-on:onClose="$store.commit('trnForm/toogleTrnFormModal', 'transferTo')"
)
  template(slot="header")
    .trnFormModal__header__back: .mdi.mdi-chevron-left
    .trnFormModal__header__title Transfer to wallet

  WalletsList(
    ui="tile"
    v-on:onClick="handleSetWallet"
  )
</template>
