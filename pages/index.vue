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
  LayoutMobile
</template>
