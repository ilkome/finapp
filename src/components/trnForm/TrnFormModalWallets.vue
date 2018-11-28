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
      this.$store.commit('toogleTrnFormModal', 'wallets')
      this.$store.commit('setTrnFormValues', { walletId })
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(
  :show="$store.state.trnForm.modal.wallets"
  title=""
  v-on:onClose="$store.commit('toogleTrnFormModal', 'wallets')"
)
  template(slot="header")
    .trnFormModal__header__back: .mdi.mdi-chevron-left
    .trnFormModal__header__title Wallets
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
