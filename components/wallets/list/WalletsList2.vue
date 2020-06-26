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

      for (const walletId of this.$store.getters['wallets/walletsSortedIds']) {
        wallets[walletId] = {
          ...this.$store.state.wallets.items[walletId],
          total: this.$store.getters['wallets/walletsTotal'][walletId].base
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
