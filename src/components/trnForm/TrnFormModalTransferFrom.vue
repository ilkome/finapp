<script>
import Icon from '@/components/icon/Icon'
import TrnFormModal from '@/components/trnForm/TrnFormModal'
import WalletsList from '@/components/wallets/list/WalletsList'

export default {
  components: {
    Icon,
    TrnFormModal,
    WalletsList
  },

  methods: {
    handleSetWallet (walletId) {
      this.$store.commit('toogleTrnFormModal', 'transferFrom')
      this.$store.commit('setTrnFormTransfer', {
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
  v-on:onClose="$store.commit('toogleTrnFormModal', 'transferFrom')"
)
  template(slot="header")
    .trnFormModal__header__back: .mdi.mdi-chevron-left
    .trnFormModal__header__title Transfer from wallet
    .trnFormModal__icon
      Icon(
        icon="mdi mdi-credit-card-multiple"
        :big="true"
        :invert="true"
      )

  WalletsList(
    ui="tile"
    v-on:onClick="handleSetWallet"
  )
</template>
