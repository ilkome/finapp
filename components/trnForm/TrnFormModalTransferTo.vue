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
  v-if="$store.state.trnForm.modal.transferTo"
  :show="$store.state.trnForm.modal.transferTo"
  title="Transfer to wallet"
  v-on:onClose="$store.commit('trnForm/toogleTrnFormModal', 'transferTo')"
)
  WalletsList(
    ui="tile"
    v-on:onClick="handleSetWallet"
  )
</template>
