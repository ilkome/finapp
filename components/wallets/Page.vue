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
    .header {{ $t('wallets.name') }}
    WalletsTotal
    WalletsList3(
      :limit="6"
      showToogle
      @onClick="(id) => handleShowWalletsModalWalletModal(id)"
    )

  template(slot="bottom")
    .buttons
      .button(@click="$store.dispatch('ui/setActiveTab', 'createWallet')") {{ $t('wallets.new') }}
      .button(@click="$store.dispatch('ui/setActiveTab', 'walletsSort')") {{ $t('base.sort') }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.header
  padding 60px 0
  font-h1()
  font-size 22px
  font-weight 600
  text-align center

  +media-laptop()
    font-size 28px

.buttons
  display flex
  align-items center
  justify-content center
  gap $m8

.button
  button-base-1()
</style>
