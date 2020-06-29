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
  v-if="$store.state.trnForm.modal.transferFrom"
  :show="$store.state.trnForm.modal.transferFrom"
  title="Transfer from wallet"
  v-on:onClose="$store.commit('trnForm/toogleTrnFormModal', 'transferFrom')"
)
  WalletsList(
    ui="tile"
    v-on:onClick="handleSetWallet"
  )
</template>
