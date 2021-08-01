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
    .buttons
      .button(@click="$store.dispatch('ui/setActiveTab', 'createWallet')") {{ $t('wallets.new') }}
      //- SharedButton(
      //-   :title="$t('wallets.new')"
      //-   className="_inline _small"
      //-   @onClick="$store.dispatch('ui/setActiveTab', 'createWallet')"
      //- )
      .button(@click="$store.dispatch('ui/setActiveTab', 'walletsSort')") {{ $t('base.sort') }}
      //- SharedButton(
      //-   :title="$t('base.sort')"
      //-   className="_inline _small"
      //-   @onClick="$store.dispatch('ui/setActiveTab', 'walletsSort')"
      //- )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.buttons
  display flex
  align-items center
  justify-content center
  gap $m8

.button
  button-base-1()
</style>
