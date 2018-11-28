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
      this.$store.commit('toogleTrnFormModal', 'transferTo')
      this.$store.commit('setTrnFormTransfer', {
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
  v-on:onClose="$store.commit('toogleTrnFormModal', 'transferTo')"
)
  template(slot="header")
    .trnFormModal__header__back: .mdi.mdi-chevron-left
    .trnFormModal__header__title Transfer to wallet
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
