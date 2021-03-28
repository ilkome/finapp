<script>

export default {
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
        walletsTiles: this.ui === 'tile',
        walletsLine: this.ui === 'line'
      }
    },

    walletsIds () {
      const walletsIds = this.$store.getters['wallets/walletsSortedIds']
      if (this.stateLimit) { return walletsIds.slice(0, this.stateLimit) }
      return walletsIds
    }
  },

  mounted () {
    this.stateLimit = this.limit
  },

  methods: {
    toogleWallets () {
      if (this.stateLimit > 0) {
        this.stateLimit = 0
      }
      else {
        this.stateLimit = this.limit
      }
    }
  }
}
</script>

<template lang="pug">
.walllets
  div(:class="className")
    WalletsItemWalletItem(
      v-for="walletId in walletsIds"
      :id="walletId"
      :key="walletId"
      :ui="ui"
      v-on="$listeners"
    )

  .walletsList__toogle(v-if="showToogle && $store.getters['wallets/walletsSortedIds'].length > limit" @click="toogleWallets")
    template(v-if="stateLimit > 0") {{ $t('wallets.showAll') }}
    template(v-else) {{ $t('wallets.showOnly') }} {{ limit }}
</template>
