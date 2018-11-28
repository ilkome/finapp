<script>
import WalletItem from '@/components/wallets/item/WalletItem'

export default {
  components: {
    WalletItem
  },

  props: {
    ui: {
      type: String,
      default: null
    },
    limit: {
      type: [Number, Boolean],
      default: null
    },
    showToogle: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      stateLimit: 0
    }
  },

  computed: {
    className () {
      return {
        walletsList: !this.ui,
        walletsWidget: this.ui === 'widget',
        walletsTiles: this.ui === 'tile',
        walletsLine: this.ui === 'line'
      }
    },

    walletsIds () {
      const walletsIds = this.$store.getters.walletsSortedIds
      if (this.stateLimit) return walletsIds.slice(0, this.stateLimit)
      return walletsIds
    }
  },

  created () {
    this.stateLimit = this.limit
  },

  methods: {
    toogleWallets () {
      if (this.stateLimit > 0) {
        this.stateLimit = 0
      } else {
        this.stateLimit = this.limit
      }
    }
  }
}
</script>

<template lang="pug">
.walllets
  div(:class="className")
    WalletItem(
      v-for="walletId in walletsIds"
      :key="walletId"
      :id="walletId"
      :ui="ui"
      v-on="$listeners"
    )
  .walletsList__toogle(v-if="showToogle && $store.getters.walletsSortedIds.length > limit" @click="toogleWallets")
    template(v-if="stateLimit > 0") show all wallets
    template(v-else) show only {{ limit }} wallet
</template>
