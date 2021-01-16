<script>
export default {
  fetch () {
    this.$store.commit('trnForm/setTrnFormTransfer', {
      tranferType: 'from',
      walletId: this.walletFromId
    })
    this.$store.commit('trnForm/setTrnFormTransfer', {
      tranferType: 'to',
      walletId: this.walletToId
    })
  },

  computed: {
    walletFromId () {
      return this.$store.state.trnForm.transfer.from || this.$store.state.trnForm.values.walletId || this.$store.getters['wallets/walletsSortedIds'][0]
    },
    walletFrom () {
      return this.$store.state.wallets.items[this.walletFromId]
    },
    walletToId () {
      return this.$store.state.trnForm.transfer.to || this.$store.getters['wallets/walletsSortedIds'][1] || this.$store.state.trnForm.values.walletId
    },
    walletTo () {
      return this.$store.state.wallets.items[this.walletToId]
    }
  }
}
</script>

<template lang="pug">
.trnFormHeader(
  v-if="$store.getters['wallets/walletsSortedIds'].length > 1"
)
  //- Wallet from
  template(v-if="walletFrom")
    .trnFormHeaderItem
      .trnFormHeaderItem__desc From wallet
      WalletItem(
        :id="walletFromId"
        :showBase="false"
        ui="tile"
        @onClick="$store.commit('trnForm/toogleTrnFormModal', 'transferFrom')"
      )

  .trnFormHeaderSeparator: .mdi.mdi-chevron-right

  //- Wallet to
  template(v-if="walletTo")
    .trnFormHeaderItem
      .trnFormHeaderItem__desc To wallet
      WalletItem(
        :id="walletToId"
        :showBase="false"
        ui="tile"
        @onClick="$store.commit('trnForm/toogleTrnFormModal', 'transferTo')"
      )
</template>

<style lang="stylus" scoped>
.trnFormHeader
  position relative

.trnFormHeaderSeparator
  z-index 2
  position absolute
  top 28px
  left 50%
  color var(--c-font-1)
  font-size 32px
  transform translate(-50%)

.trnFormHeaderItem
  &__desc
    margin-bottom 2px
    color var(--c-font-2)
    font-size 12px

  .walletItemGrid
    width 100%
</style>
