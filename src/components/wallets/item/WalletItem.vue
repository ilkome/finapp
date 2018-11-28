<script>
import Amount from '@/components/amount/Amount'
import Icon from '@/components/icon/Icon'

export default {
  components: { Amount, Icon },

  props: {
    ui: {
      type: String,
      default: null
    },
    id: {
      type: String,
      required: true
    }
  },

  computed: {
    className () {
      return {
        walletItem: !this.ui,
        walletItemWidget: this.ui === 'widget',
        walletItemTile: this.ui === 'tile',
        walletItemLine: this.ui === 'line'
      }
    },
    styles () {
      return {
        background: (this.ui === 'widget' || this.ui === 'tile' || this.ui === 'line') && (this.wallet.color || this.$store.state.ui.defaultBgColor)
      }
    },

    wallet () {
      return {
        ...this.$store.state.wallets.items[this.id],
        total: this.$store.getters.walletsTotal[this.id].base
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
      this.$store.dispatch('setActiveTab', 'stat')
      this.$store.dispatch('setFilterWalletId', this.id)
    }
  }
}
</script>

<template lang="pug">
div(
  :class="className"
  :style="styles"
  @click="handleClick")

  //- widget
  template(v-if="ui === 'widget'")
    .walletItemWidget__name {{ wallet.name }}
    .walletItemWidget__amount
      Amount(
        :alwaysShowSymbol="true"
        :value="wallet.total"
        :currency="wallet.currency")

  //- tile
  template(v-else-if="ui === 'tile' || ui === 'line'")
    .walletItemTile__name {{ wallet.name }}
    .walletItemTile__amount
      Amount(
        :alwaysShowSymbol="true"
        :value="wallet.total"
        :currency="wallet.currency")

  //- list
  template(v-else)
    .walletItem__grid
      .walletItem__icon(
        @click.stop="handleIconClick")
        Icon(
          :abbr="wallet.name"
          :background="wallet.color || $store.state.ui.defaultBgColor")
      .walletItem__name {{ wallet.name }}
      .walletItem__amount
        Amount(
          :alwaysShowSymbol="true"
          :value="wallet.total"
          :currency="wallet.currency")
      .walletItem__line
</template>
