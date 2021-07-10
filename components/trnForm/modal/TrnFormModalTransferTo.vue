<script>
import { useContext } from '@nuxtjs/composition-api'

export default {
  name: 'TrnFormModalTransferTo',

  setup () {
    const { store } = useContext()

    function onClickWallet (walletId, close) {
      store.commit('trnForm/setTrnFormValues', {
        walletToId: walletId,
        walletId
      })
      close()
    }

    function afterClose () {
      store.commit('trnForm/closeTrnFormModal', 'transferTo')
    }

    return {
      onClickWallet,
      afterClose
    }
  }
}
</script>

<template lang="pug">
TrnFormModal(@closed="afterClose")
  template(#header)
    template Transfer to wallet

  template(#default="{ close }")
    .trnFormWalletsList.scrollerBlock
      WalletsList3(@onClick="walletId => onClickWallet(walletId, close)")
</template>

<style lang="stylus">
@import '~assets/stylus/variables'

.trnFormWalletsList
  overflow hidden
  overflow-y auto
  height 100%
  padding-bottom 16px
</style>
