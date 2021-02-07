<script>
export default {
  methods: {
    handleSetWallet (walletId) {
      this.$store.commit('trnForm/toogleTrnFormModal', 'transferTo')
      this.$store.commit('trnForm/setTrnFormValues', {
        walletToId: walletId,
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
  @onClose="$store.commit('trnForm/toogleTrnFormModal', 'transferTo')"
)
  WalletsList3(
    @onClick="handleSetWallet"
  )
</template>
