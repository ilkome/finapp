<script>
// TODO: add check for valid wallet
export default {
  name: 'TrnFormHeaderItemWallet',

  computed: {
    wallet () {
      const walletId = this.$store.state.trnForm.values.walletId
      return this.$store.state.wallets.items[walletId]
    }
  }
}
</script>

<template lang="pug">
.trnFormHeaderItem(
  v-if="wallet"
  @click="$store.commit('trnForm/showTrnFormModal', 'wallets')"
)
  WalletsItemWalletItem(
    :id="$store.state.trnForm.values.walletId"
    :showBase="false"
    :isAltColor="true"
    ui="tile"
  )

  .trnFormHeaderItem__dots: .mdi.mdi-dots-vertical
</template>

<style lang="stylus" scoped>
.trnFormHeaderItem
  padding 0

  .walletItemGrid
    width 100%
</style>
