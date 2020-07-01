<script>
export default {
  computed: {
    walletFromId () {
      return this.$store.state.trnForm.transfer.from || this.$store.getters['wallets/walletsSortedIds'][0]
    },
    walletFrom () {
      return this.$store.state.wallets.items[this.walletFromId]
    },
    walletToId () {
      return this.$store.state.trnForm.transfer.to || this.$store.getters['wallets/walletsSortedIds'][1]
    },
    walletTo () {
      return this.$store.state.wallets.items[this.walletToId]
    }
  },

  created () {
    this.$store.commit('trnForm/setTrnFormTransfer', {
      tranferType: 'from',
      walletId: this.walletFromId
    })
    this.$store.commit('trnForm/setTrnFormTransfer', {
      tranferType: 'to',
      walletId: this.walletToId
    })
  }
}
</script>

<template lang="pug">
.trnFormHeader
  //- Wallet from
  template(v-if="walletFrom")
    .trnFormHeaderItem(
      :style="{ background: walletFrom.color || $store.state.ui.defaultBgColor }"
      @click="$store.commit('trnForm/toogleTrnFormModal', 'transferFrom')"
    )
      .trnFormHeaderItem__in
        .trnFormHeaderItem__desc From wallet
        .trnFormHeaderItem__name {{ walletFrom.name }}
        .trnFormHeaderItem__total
          Amount(
            :value="$store.getters['wallets/walletsTotal'][walletFromId].base"
            :currency="$store.state.currencies.base"
            vertical="left"
          )

  .trnFormHeaderSeparator: .mdi.mdi-chevron-right

  //- Wallet to
  template(v-if="walletTo")
    .trnFormHeaderItem(
      :style="{ background: walletTo.color || $store.state.ui.defaultBgColor }"
      @click="$store.commit('trnForm/toogleTrnFormModal', 'transferTo')"
    )
      .trnFormHeaderItem__in
        .trnFormHeaderItem__desc To wallet
        .trnFormHeaderItem__name {{ walletTo.name }}
        .trnFormHeaderItem__total
          Amount(
            :value="$store.getters['wallets/walletsTotal'][walletToId].base"
            :currency="$store.state.currencies.base"
            vertical="left"
          )
</template>

<style lang="stylus" scoped>
.trnFormHeader
  position relative

.trnFormHeaderSeparator
  z-index 2
  position absolute
  top 45%
  left 50%
  color var(--c-font-3)
  font-size 28px
  transform translate(-50%)

.trnFormHeaderItem
  position relative
  flex-grow 1
  padding 16px 16px
  color var(--c-bg-5)
  border-radius 12px

  @media $media-laptop
    min-height 61px

  &__desc
    color var(--c-font-2)
    font-size 12px
    margin-bottom 12px
    padding-bottom 6px
    border-bottom 1px solid var(--c-bg-10)

  &__icon
    z-index 2

  &__total
    padding-top $m5

  &__name
    color var(--c-font-1)
    font-size 14px

  &__dots
    position absolute
    top $m6
    right $m4
    color var(--c-font-2)
    font-size 16px
</style>
