<script>
export default {
  props: {
    ids: {
      type: Array,
      default: () => []
    }
  },

  computed: {
    trns () {
      const trns = {}
      const trnsIds = this.ids

      for (const trnId of trnsIds) {
        const trn = this.$store.state.trns.items[trnId]
        const wallet = this.$store.state.wallets.items[trn.walletId]
        const category = this.$store.state.categories.items[trn.categoryId]

        trns[trnId] = {
          id: trnId,
          trn,
          category,
          wallet
        }
      }

      return trns
    }
  }
}
</script>

<template lang="pug">
.trnsList
  template(v-if="trns")
    slot(:trns="trns")
</template>
