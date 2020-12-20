<script>
export default {
  props: {
    ui: {
      type: String,
      default: null
    },
    id: {
      type: String,
      required: true
    },
    showBase: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    className () {
      return {
        walletItem: !this.ui,
        walletItemTile: this.ui === 'tile',
        walletItemLine: this.ui === 'line'
      }
    },
    styles () {
      return {
        background: (this.ui === 'tile' || this.ui === 'line') && (this.wallet.color || this.$store.state.ui.defaultBgColor)
      }
    },

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
div(
  :class="className"
  :style="styles"
  @click="handleClick"
)
  //- tile
  template(v-if="ui === 'tile' || ui === 'line'")
    .walletItemTile__name {{ wallet.name }}
    .walletItemTile__amount
      Amount(
        :currency="wallet.currency"
        :isAltColor="$attrs.isAltColor"
        :showBase="showBase"
        :value="wallet.total"
        alwaysShowSymbol
        vertical="left"
      )

  //- list
  template(v-else)
    .walletItem__grid
      .walletItem__icon(@click.stop="handleIconClick")
        Icon(
          :abbr="wallet.name"
          :background="wallet.color || $store.state.ui.defaultBgColor"
          medium
        )
      .walletItem__name {{ wallet.name }}
      .walletItem__amount
        Amount(
          :currency="wallet.currency"
          :isAltColor="$attrs.isAltColor"
          :value="wallet.total"
          alwaysShowSymbol
        )
      .walletItem__line
</template>
