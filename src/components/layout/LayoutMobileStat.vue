<script>
import StatChartsLine from '@/components/stat/StatChartsLine'
import StatMobile from '@/components/stat/StatMobile'
import WalletsList from '@/components/wallets/list/WalletsList'

export default {
  components: {
    StatChartsLine,
    StatMobile,
    WalletsList
  },

  methods: {
    handleShowWalletModal (id) {
      this.$store.commit('showWalletModal')
      this.$store.commit('setWalletModalId', id)
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
      v-on:onClick="id => handleShowWalletModal(id)")

  .layoutStat__chart(v-show="$store.state.ui.statGraphsVisibility === 'visible' && ($store.state.filter.period !== 'all')")
    StatChartsLine

  .layoutStat__summary
    StatMobile
</template>

<style lang="stylus" scoped>
.layoutStat
  height 100%
  overflow hidden
  overflow-y auto
</style>
