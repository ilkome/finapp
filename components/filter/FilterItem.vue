<script>
export default {
  props: {
    color: {
      type: String,
      default: null
    },

    icon: {
      type: String,
      default: null
    },

    name: {
      type: String,
      default: null
    },

    walletId: {
      type: String,
      default: null
    }
  },

  computed: {
    className () {
      return {
        _mobile: this.$store.state.ui.mobile,
        _pc: this.$store.state.ui.pc
      }
    },

    wallet () {
      return this.$store.state.wallets.items[this.walletId]
    }
  }
}
</script>

<template lang="pug">
.filterItem(
  :class="className"
  @click="$emit('onClick')"
)
  //- Wallet
  template(v-if="walletId && wallet")
    .filterItemWallet__line(:style="{ background: wallet.color }")
    .filterItemWallet
      .filterItemWallet__amount
        Amount(
          :alwaysShowSymbol="false"
          :currency="wallet.currency"
          :showBase="false"
          :value="$store.getters['wallets/walletsTotal'][walletId].base"
          vertical="center"
        )
      .filterItem__name {{ wallet.name }}
      .filterItem__close: .mdi.mdi-close

  //- Category
  template(v-if="!walletId")
    .filterItem__icon
      Icon(
        :color="color"
        :icon="icon"
      )
    .filterItem__name {{ name }}
    .filterItem__close: .mdi.mdi-close
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.filterItemWallet
  display flex
  flex-flow column
  justify-content center

  &__amount
    padding-top $m3
    padding-bottom $m5

  &__line
    position absolute
    top 0
    left 0
    width 100%
    height 2px

.filterItem
  overflow hidden
  cursor pointer
  position relative
  display flex
  flex-flow column
  justify-content center
  min-width 80px
  flex-grow 0
  margin 0 $m4
  padding $m6 $m7
  color var(--c-font-1)
  font-size 12px
  white-space nowrap
  background var(--c-item-bg-main)
  border 1px solid transparent
  border-radius $m6

  +media(600px)
    margin 0 $m5

  +media(1000px)
    margin 0 $m6

  +media-hover()
    &:not(._active)
      background var(--c-item2-bg-hover)
      border 1px solid var(--c-item2-bd-hover)

  &__icon
    opacity .8
    padding-bottom $m4
    color var(--c-font-1)

    .icon
      width auto
      height auto

  &__name
    overflow hidden
    text-overflow ellipsis
    color var(--c-font-4)
    font-size 13px
    text-align center
    anim()

  &__close
    opacity .8
    position absolute
    top $m3
    right $m3
    color var(--c-font-5)
    font-size 14px
</style>
