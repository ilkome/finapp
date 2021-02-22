<script>
import { computed, useContext } from '@nuxtjs/composition-api'

export default {
  name: 'TrnFormModalTransferTo',

  setup () {
    const { store } = useContext()
    const isShow = computed(() => store.state.trnForm.modal.transferTo)

    function setWalletToId (walletId) {
      store.commit('trnForm/toogleTrnFormModal', 'transferTo')
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
  @onClose="$store.commit('trnForm/toogleTrnFormModal', 'transferTo')"
)
  WalletsList3(@onClick="setWalletToId")
</template>
