<script>
import Welcome from '~/components/welcome/Welcome'

export default {
  name: 'WelcomePage',

  components: {
    Welcome
  },

  computed: {
    newUserData () {
      if (!this.$store.getters['wallets/hasWallets'] && !this.$store.getters['categories/hasCategories']) {
        return true
      }
      return false
    }
  },

  watch: {
    newUserData (newUserData) {
      if (!newUserData) {
        this.$router.push('/')
      }
    }
  },

  mounted () {
    if (!this.newUserData) {
      this.$router.push('/')
    }
  }
}
</script>

<template lang="pug">
Welcome(v-if="newUserData")
</template>

<style lang="stylus" scoped>
// style here
</style>
