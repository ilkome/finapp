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
.wallets
  .wallets__grid
    WalletsItemWalletItem2(
      :activeItemId="activeItemId"
      v-for="walletId in walletsIds"
      :id="walletId"
      :key="walletId"
      :showBase="showBase"
      v-on="$listeners"
    )

  .wallets__toogle(v-if="showToogle && $store.getters['wallets/walletsSortedIds'].length > limit" @click="toogleWallets")
    template(v-if="stateLimit > 0") {{ this.$t('wallets.showAll') }}
    template(v-else) {{ this.$t('wallets.showOnly') }} {{ limit }}
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.wallets
  padding 0 $m7

  &__grid
    display grid
    grid-template-columns repeat(2, 1fr)
    grid-column-gap $m7
    grid-row-gap $m7

    +media(600px)
      grid-template-columns repeat(auto-fill, minmax(220px, 1fr))
      grid-column-gap $m7
      grid-row-gap $m7

  &__toogle
    button-base-1()
    margin-top $m9
    margin-bottom $m9
</style>
