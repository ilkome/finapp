<script>
export default {
  name: 'WalletsPageMobile',

  methods: {
    handleShowWalletModal (id) {
      this.$store.commit('wallets/showWalletModal')
      this.$store.commit('wallets/setWalletModalId', id)
    }
  }
}
</script>

<template lang="pug">
ComponentWrap(:contentPadding="false")
  template(slot="content")
    WalletsTotal
    WalletsList3(
      :limit="6"
      showToogle
      @onClick="(id) => handleShowWalletModal(id)"
    )

  template(slot="bottom")
    .flex
      .col
        Button(
          :title="$t('wallets.new')"
          className="_inline _small"
          @onClick="$store.dispatch('ui/setActiveTab', 'createWallet')"
        )
      .col
        Button(
          :title="$t('base.sort')"
          className="_inline _small"
          @onClick="$store.dispatch('ui/setActiveTab', 'walletsSort')"
        )
</template>

<style lang="stylus" scoped>
//
</style>
