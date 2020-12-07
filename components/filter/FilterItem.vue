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
    .filterItemWallet__line(:style="{ background: wallet.color || $store.state.ui.defaultBgColor }")
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

  //- Category
  template(v-if="!walletId")
    .filterItem__icon
      Icon(
        :color="color"
        :icon="icon"
      )
    .filterItem__name {{ name }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables/animations'
@import '~assets/stylus/variables/margins'
@import '~assets/stylus/variables/media'

.filterItemWallet
  display flex
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
  flex-grow 0
  margin 0 $m4
  padding $m5 $m7
  color var(--c-font-1)
  white-space nowrap
  background var(--c-bg-6)
  border-radius $m5

  +media-tablet()
    background var(--c-bg-5)

  &._pc
    margin-right $m6

  &:active
    background var(--c-bg-5)

  &:last-child
    +media-tablet('less')
      margin-right auto

  &:first-child
    +media-tablet('less')
      margin-left auto

  &:last-child&:after
    display none

  &._clear
    margin-right 0
    margin-left auto
    color var(--c-font-4)

    &:hover
      @media $media-laptop
        color var(--c-font-1)
        background var(--c-blue-1)

  &__icon
    opacity .8
    padding-bottom $m4
    color var(--c-font-1)

    .icon
      width auto
      height auto

      ^[0]._clear &
        color var(--c-font-4)

      ^[0]:hover &
        color var(--c-font-1)

  &__name
    overflow hidden
    text-overflow ellipsis
    color var(--c-font-4)
    font-size 13px
    text-align center

    ~/:hover &
      color var(--c-font-2)

  &__close
    margin-left auto
    padding-left 10px
    color var(--c-font-1)

    @media $media-laptop
      opacity 0
      position absolute
      top (- $m6)
      right (- $m6)
      padding $m4
      background var(--c-bg-3)
      border 1px solid var(--c-bg-1)
      border-radius $m3
      anim()

    ^[0]:hover:not(._clear) &
      @media $media-laptop
        opacity 1
</style>
