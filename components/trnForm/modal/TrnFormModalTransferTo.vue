<script>
import { computed, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'TrnFormModalTransferTo',

  setup () {
    const { store } = useContext()
    const isShow = computed(() => store.state.trnForm.modal.transferTo)

    function setWalletToId (walletId) {
      store.commit('trnForm/closeTrnFormModal', 'transferTo')
      store.commit('trnForm/setTrnFormValues', {
        walletToId: walletId,
        walletId
      })
    }

    return {
      isShow,
      setWalletToId
    }
  }
}
</script>

<template lang="pug">
LazyTrnFormModal.doNotCloseTrnModal(
  v-if="isShow"
  :isShow="isShow"
  title="Transfer to wallet"
  position="bottom"
  @onClose="$store.commit('trnForm/closeTrnFormModal', 'transferTo')"
)
  WalletsList3(@onClick="setWalletToId")
</template>
