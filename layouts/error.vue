<script>
export default {
  name: 'ErrorLayout',

  // eslint-disable-next-line vue/require-prop-types
  props: ['error'],

  fetch () {
    if (Object.keys(this.$route.query).length > 0) {
      this.$router.replace({ query: null })
    }
  },

  computed: {
    statusCode () {
      return (this.error && this.error.statusCode) || 500
    }
  }
}
</script>

<template lang="pug">
.container
  h1 Error
  pre {{ error }}
  h1(@click="$router.push('/')") Index
</template>

<style lang="stylus">
@import "~assets/stylus/variables"

.container
  padding $m9
</style>
