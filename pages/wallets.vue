<script>
export default {
  name: 'WalletsPage',

  head () {
    return {
      title: this.$t('wallets.title')
    }
  },

  methods: {
    handleShowWalletsModalWalletModal (id) {
      this.$store.commit('wallets/showWalletsModalWalletModal')
      this.$store.commit('wallets/setWalletsModalWalletModalId', id)
    }
  }
}
</script>

<template lang="pug">
LayoutBaseWrap(:contentPadding="false")
  template(slot="content")
    .header {{ $t('wallets.name') }}

    div(style="padding: 0 0 16px 0")
      WalletsTotal(
        isShowCredits
        isShowTotal
      )

    WalletsList3(
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
  header-title()

.buttons
  display flex
  align-items center
  justify-content center
  gap $m8

.button
  button-base-1()
</style>
