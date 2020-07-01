<script>
export default {
  methods: {
    handleShowWalletModal (id) {
      this.$store.commit('wallets/showWalletModal')
      this.$store.commit('wallets/setWalletModalId', id)
    }
  }
}
</script>

<template lang="pug">
.layoutStat
  .layoutStat__wallets(v-show="$store.state.ui.stat.walletsVisibility === 'visible'")
    WalletsList(
      :limit="3"
      ui="widget"
      @onClick="id => handleShowWalletModal(id)")

  .layoutStat__chart(v-show="$store.state.ui.statGraphsVisibility === 'visible' && ($store.state.filter.period !== 'all')")
    StatChartsLine

  .layoutStat__summary
    StatMobile
</template>

<style lang="stylus" scoped>
.layoutStat
  overflow hidden
  height 100%
  overflow-y auto
</style>
