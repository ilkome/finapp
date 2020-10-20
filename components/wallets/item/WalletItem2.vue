<script>
export default {
  name: 'WalletItem2',

  props: {
    id: {
      type: String,
      required: true
    },

    showBase: {
      type: Boolean,
      default: true
    },

    vertical: {
      type: String,
      default: 'left'
    },

    size: {
      type: String,
      default: null
    }
  },

  computed: {
    wallet () {
      return {
        ...this.$store.state.wallets.items[this.id],
        total: this.$store.getters['wallets/walletsTotal'][this.id].base
      }
    }
  },

  methods: {
    handleClick () {
      if (this.$listeners.onClick) {
        this.$listeners.onClick(this.id)
      }
    },

    handleIconClick () {
      this.$store.dispatch('ui/setActiveTab', 'stat')
      this.$store.dispatch('filter/setFilterWalletId', this.id)
    }
  }
}
</script>

<template lang="pug">
.walletItemGrid(
  @click="handleClick"
)
  .walletItemGrid__line(:style="{ background: wallet.color || $store.state.ui.defaultBgColor }")
  .walletItemGrid__name {{ wallet.name }}
  .walletItemGrid__amount
    Amount(
      :alwaysShowSymbol="true"
      :currency="wallet.currency"
      :showBase="showBase"
      :size="size"
      :value="wallet.total"
      :vertical="vertical"
    )
</template>

<style lang="stylus">
@import "~assets/stylus/variables"

.walletItemGrid
  overflow hidden
  cursor pointer
  padding $m6 $m6
  padding-top 0
  background var(--c-bg-3)
  border-radius $m5

  &__line
    opacity 1
    height 4px
    margin 0 (- $m6)
    margin-bottom $m6

  &__name
    padding-bottom $m5
    color var(--c-font-2)
    font-size 16px
</style>
