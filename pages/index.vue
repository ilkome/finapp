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
.layout__wrap(v-if="$store.getters['user/userUid']")
  LazyLayoutMobile(v-if="$store.state.ui.mobile")
  LazyLayoutPc(v-if="$store.state.ui.pc")
</template>
