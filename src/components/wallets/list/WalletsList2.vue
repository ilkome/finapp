<script>
export default {
  props: {
    limit: {
      type: Number,
      default: null
    }
  },

  computed: {
    wallets () {
      const wallets = {}
      const walletsIds = this.$store.getters.walletsSortedIds

      for (const walletId of walletsIds) {
        wallets[walletId] = {
          ...this.$store.state.wallets.items[walletId],
          total: this.$store.getters.walletsTotal[walletId].base
        }
      }

      return wallets
    }
  }
}
</script>

<template lang="pug">
.walletsList
  slot(:wallets="wallets")
</template>
