<script>
export default {
  methods: {
    handleSetWallet (walletId) {
      this.$store.commit('trnForm/toogleTrnFormModal', 'transferFrom')
      this.$store.commit('trnForm/setTrnFormValues', {
        walletFromId: walletId,
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
  @onClose="$store.commit('trnForm/toogleTrnFormModal', 'transferFrom')"
)
  WalletsList3(
    @onClick="handleSetWallet"
  )
</template>
