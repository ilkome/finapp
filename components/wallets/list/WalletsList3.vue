<script>
export default {
  props: {
    activeItemId: { type: String, default: null },
    limit: { type: [Number, Boolean], default: null },
    showBase: { type: Boolean, default: true },
    showToogle: { type: Boolean, default: false },
  },

  data() {
    return {
      stateLimit: 0,
    }
  },

  computed: {
    walletsIds() {
      const walletsIds = this.$store.getters['wallets/walletsSortedIds']
      if (this.stateLimit) return walletsIds.slice(0, this.stateLimit)
      return walletsIds
    },
  },

  mounted() {
    this.stateLimit = this.limit
  },

  methods: {
    toogleWallets() {
      if (this.stateLimit > 0)
        this.stateLimit = 0
      else
        this.stateLimit = this.limit
    },
  },
}
</script>

<template lang="pug">
.wallets
  .wallets__grid.px-3
    WalletsItemWalletItem(
      :activeItemId="activeItemId"
      v-for="walletId in walletsIds"
      :id="walletId"
      :key="walletId"
      :showBase="showBase"
      v-on="$listeners"
    )
</template>

<style lang="stylus" scoped>
.wallets
  &__grid
    display grid
    grid-template-columns repeat(2, 1fr)
    grid-column-gap $m6
    grid-row-gap $m6

    +media(600px)
      grid-template-columns repeat(auto-fill, minmax(200px, 1fr))
      grid-column-gap $m6
      grid-row-gap $m6
</style>
