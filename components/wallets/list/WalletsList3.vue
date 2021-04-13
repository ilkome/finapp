<script>

export default {
  name: 'WalletsList3',

  props: {
    limit: {
      type: [Number, Boolean],
      default: null
    },

    showToogle: {
      type: Boolean,
      default: false
    },

    showBase: {
      type: Boolean,
      default: true
    },

    activeItemId: {
      type: String,
      default: null
    }
  },

  data () {
    return {
      stateLimit: 0
    }
  },

  computed: {
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
  .walllets__grid
    WalletsItemWalletItem2(
      :activeItemId="activeItemId"
      v-for="walletId in walletsIds"
      :id="walletId"
      :key="walletId"
      :showBase="showBase"
      v-on="$listeners"
    )

  .walletsList__toogle._alt(v-if="showToogle && $store.getters['wallets/walletsSortedIds'].length > limit" @click="toogleWallets")
    template(v-if="stateLimit > 0") {{ this.$t('wallets.showAll') }}
    template(v-else) {{ this.$t('wallets.showOnly') }} {{ limit }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.walllets
  padding 0 $m7

.walllets__grid
  display grid
  grid-template-columns repeat(2, 1fr)
  grid-column-gap $m7
  grid-row-gap $m7

.walletsList__toogle._alt
  margin-right 0
  margin-left 0
  border-top 0
</style>
