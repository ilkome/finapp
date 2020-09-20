<script>
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
  :style="{ background: wallet.color || $store.state.ui.defaultBgColor }"
  @click="$store.commit('trnForm/toogleTrnFormModal', 'wallets')"
)
  .trnFormHeaderItem__in
    .trnFormHeaderItem__name {{ wallet.name }}
    .trnFormHeaderItem__total
      template(v-if="$store.getters['wallets/walletsTotal'][$store.state.trnForm.values.walletId]")
        Amount(
          :value="$store.getters['wallets/walletsTotal'][$store.state.trnForm.values.walletId].base"
          :currency="wallet.currency"
          vertical="left"
        )
      template(v-else)
        Amount(
          :value="0"
          :currency="$store.state.currencies.base"
          vertical="left"
        )
  .trnFormHeaderItem__dots: .mdi.mdi-dots-vertical
</template>

<style lang="stylus" scoped>
//
</style>
