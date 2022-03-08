<script>
// TODO: add check for valid wallet
export default {
  name: 'TrnFormHeaderItemWallet',

  computed: {
    wallet() {
      const walletId = this.$store.state.trnForm.values.walletId
      return this.$store.state.wallets.items[walletId]
    },
  },
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
  )

  .trnFormHeaderItem__dots.text-neutral-500(
    class="dark_text-neutral-400"
  ): .mdi.mdi-dots-vertical
</template>

<style lang="stylus" scoped>
.trnFormHeaderItem
  +media-hover()
    transform scale(1.04)

  .walletItemGrid
    width 100%
</style>
