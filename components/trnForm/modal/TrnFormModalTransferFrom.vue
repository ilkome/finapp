<script>
import { computed, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'TrnFormModalTransferFrom',

  setup () {
    const { store } = useContext()
    const isShow = computed(() => store.state.trnForm.modal.transferFrom)

    function setWalletFromId (walletId) {
      store.commit('trnForm/closeTrnFormModal', 'transferFrom')
      store.commit('trnForm/setTrnFormValues', {
        walletFromId: walletId,
        walletId
      })
    }

    return {
      isShow,
      setWalletFromId
    }
  }
}
</script>

<template lang="pug">
LazyTrnFormModal.doNotCloseTrnModal(
  v-if="isShow"
  :isShow="isShow"
  title="Transfer from wallet"
  position="bottom"
  @onClose="$store.commit('trnForm/closeTrnFormModal', 'transferFrom')"
)
  WalletsList3(@onClick="setWalletFromId")
</template>
