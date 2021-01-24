<script>
export default {
  name: 'IndexPage',

  fetch () {
    if (!this.$store.getters['wallets/hasWallets'] ||
        !this.$store.getters['categories/hasCategories']) {
      this.$router.replace('/welcome')
    }
  }
}
</script>

<template lang="pug">
.layout(v-if="$store.getters['user/userUid']")
  LazyLayoutMobile(v-if="$store.state.ui.mobile")
  LazyLayoutPc(v-if="$store.state.ui.pc")
</template>

<style lang="stylus" scoped>
.layout
  height 100%
</style>
