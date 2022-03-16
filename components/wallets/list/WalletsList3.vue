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
.grid.gap-y-1.gap-2.3sm_grid-cols-2.sm_gap-x-6
  WalletsItemWalletItem(
    :activeItemId="activeItemId"
    v-for="walletId in walletsIds"
    :id="walletId"
    :key="walletId"
    :showBase="showBase"
    v-on="$listeners"
  )
</template>
