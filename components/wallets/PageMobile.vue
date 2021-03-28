<script>
export default {
  name: 'WalletsPageMobile',

  methods: {
    handleShowWalletsModalWalletModal (id) {
      this.$store.commit('wallets/showWalletsModalWalletModal')
      this.$store.commit('wallets/setWalletsModalWalletModalId', id)
    }
  }
}
</script>

<template lang="pug">
LayoutComponentWrap(:contentPadding="false")
  template(slot="content")
    WalletsTotal
    WalletsList3(
      :limit="6"
      showToogle
      @onClick="(id) => handleShowWalletsModalWalletModal(id)"
    )

  template(slot="bottom")
    .flex
      .col
        SharedButton(
          :title="$t('wallets.new')"
          className="_inline _small"
          @onClick="$store.dispatch('ui/setActiveTab', 'createWallet')"
        )
      .col
        SharedButton(
          :title="$t('base.sort')"
          className="_inline _small"
          @onClick="$store.dispatch('ui/setActiveTab', 'walletsSort')"
        )
</template>

<style lang="stylus" scoped>
//
</style>
